import React, { createContext, useContext, useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCATION_KEY = '@orderme_location_permission';

const LocationContext = createContext(null);

async function getCityFromCoords(lat, lng) {
  try {
    const geo = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    if (geo?.[0]) {
      const g = geo[0];
      return g.city || g.subregion || g.district || g.region || '';
    }
  } catch (_) {}
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { signal: AbortSignal.timeout(4000) },
    );
    if (res.ok) {
      const data = await res.json();
      return (
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        ''
      );
    }
  } catch (_) {}
  return '';
}

export function LocationProvider({ children }) {
  const [coords, setCoords] = useState(null);
  const [cityName, setCityName] = useState('');
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const refreshLocation = useCallback(async () => {
    try {
      setLoading(true);
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude: lat, longitude: lng } = pos.coords;
      setCoords({ lat, lng });
      const city = await getCityFromCoords(lat, lng);
      if (city) setCityName(city);
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  const requestPermission = useCallback(async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      await AsyncStorage.setItem(LOCATION_KEY, status);
      if (status === 'granted') await refreshLocation();
    } catch (_) {}
    finally { setLoading(false); }
    setShowPermissionModal(false);
  }, [refreshLocation]);

  const declinePermission = useCallback(async () => {
    setPermissionStatus('denied');
    await AsyncStorage.setItem(LOCATION_KEY, 'denied');
    setShowPermissionModal(false);
  }, []);

  const promptLocationIfNeeded = useCallback(async () => {
    if (Platform.OS === 'web') return;
    try {
      const cached = await AsyncStorage.getItem(LOCATION_KEY);
      if (cached) {
        setPermissionStatus(cached);
        if (cached === 'granted') await refreshLocation();
        return;
      }
      const { status: existing } = await Location.getForegroundPermissionsAsync();
      if (existing === 'granted') {
        setPermissionStatus('granted');
        await AsyncStorage.setItem(LOCATION_KEY, 'granted');
        await refreshLocation();
        return;
      }
      setShowPermissionModal(true);
    } catch (_) {
      setShowPermissionModal(true);
    }
  }, [refreshLocation]);

  return (
    <LocationContext.Provider value={{
      coords, cityName, permissionStatus, loading,
      showPermissionModal, setShowPermissionModal,
      requestPermission, declinePermission, promptLocationIfNeeded, refreshLocation,
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}
