import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCATION_KEY = '@orderme_location_permission';

const LocationContext = createContext(null);

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
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });

      const geo = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      if (geo?.[0]) {
        const g = geo[0];
        setCityName(g.city || g.subregion || g.region || '');
      }
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  const requestPermission = useCallback(async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      await AsyncStorage.setItem(LOCATION_KEY, status);
      if (status === 'granted') {
        await refreshLocation();
      }
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
    const cached = await AsyncStorage.getItem(LOCATION_KEY);
    if (cached) {
      setPermissionStatus(cached);
      if (cached === 'granted') await refreshLocation();
      return;
    }
    setShowPermissionModal(true);
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
