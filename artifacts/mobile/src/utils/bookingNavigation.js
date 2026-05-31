import { Linking, Alert, Platform } from 'react-native';
import { ORDERME_SUPPORT } from '../data/websiteCatalog';

function rootNavigation(navigation) {
  let nav = navigation;
  while (nav?.getParent?.()) {
    nav = nav.getParent();
  }
  return nav;
}

export function resolveServicePhone(service, provider, { preferSecondary = false } = {}) {
  const fromService = preferSecondary
    ? service?.phoneSecondary || service?.phones?.[1]
    : service?.phone || service?.phones?.[0] || service?.contactPhone;
  if (service?.providerId === 'orderme' || service?.websiteService) {
    return provider?.phone || fromService || ORDERME_SUPPORT.phone;
  }
  return provider?.phone || fromService || null;
}

export function formatServicePhones(service) {
  const list = [];
  if (service?.phone) list.push(service.phone);
  if (service?.phoneSecondary && service.phoneSecondary !== service.phone) {
    list.push(service.phoneSecondary);
  }
  (service?.phones || []).forEach((p) => {
    if (p && !list.includes(p)) list.push(p);
  });
  return list.slice(0, 2);
}

/** Dial the provider for this service. */
export function callServiceNow(service, provider) {
  const phone = resolveServicePhone(service, provider);
  if (!phone) {
    Alert.alert('No phone number', 'Contact number is not available for this service.');
    return false;
  }
  callPhone(phone);
  return true;
}

/** Dial a provider directly from map or profile. */
export function callProviderNow(provider) {
  if (!provider?.phone) {
    Alert.alert('No phone number', 'Contact number is not available.');
    return false;
  }
  callPhone(provider.phone);
  return true;
}

/**
 * Open SMS/messaging app to message a provider.
 * Replaces in-app chat — sends user to native SMS app.
 */
export function openInAppChat(navigation, { provider, prefillMessage = '' } = {}) {
  const phone = provider?.phone || '';
  const msg = prefillMessage || 'Hello, I would like more information about your service.';
  return messageProvider(phone, msg);
}

/**
 * Open SMS from a service context.
 */
export function openChatFromService(navigation, service, provider) {
  const phone = provider?.phone || service?.phone || service?.phones?.[0] || '';
  const msg = 'Hello, I would like more information about your service.';
  return messageProvider(phone, msg);
}

/**
 * Open SMS from a booking context.
 */
export function openChatFromBooking(navigation, provider) {
  const phone = provider?.phone || '';
  const msg = 'Hello, I have a question regarding my booking.';
  return messageProvider(phone, msg);
}

/** Navigate to My Bookings tab. */
export function openChatbot(navigation) {
  rootNavigation(navigation).navigate('MyBookings');
  return true;
}

export function openServiceOrBook(navigation, service) {
  if (!service?.id) return false;
  rootNavigation(navigation).navigate('ServiceDetail', { service });
  return true;
}

/** In-app booking flow (syncs to Firebase Realtime Database). */
export function navigateToBooking(navigation, { service, selectedPackage, provider }) {
  if (!service?.id || !selectedPackage) return false;
  rootNavigation(navigation).navigate('Booking', { service, selectedPackage, provider });
  return true;
}

export function callPhone(phone) {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) {
    Alert.alert('No phone number', 'Phone number is not available.');
    return;
  }
  const url = `tel:${digits}`;
  if (Platform.OS === 'web') {
    Linking.openURL(url).catch(() => {
      Alert.alert('Call provider', phone, [{ text: 'OK', style: 'cancel' }]);
    });
    return;
  }
  Linking.canOpenURL(url).then((ok) => {
    if (ok) Linking.openURL(url);
    else Alert.alert('Cannot call', 'Phone dialer is not available.');
  });
}

/** @deprecated Use openInAppChat instead. Opens SMS app on mobile. */
export function messageProvider(phone, defaultMessage = '') {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) {
    Alert.alert('No phone number', 'Phone number is not available.');
    return false;
  }
  const msg = defaultMessage || 'Hello, I would like more information about your service.';
  const url = `sms:${digits}?body=${encodeURIComponent(msg)}`;
  if (Platform.OS === 'web') {
    Alert.alert('Message', `Would open SMS to ${phone}\n\nMessage:\n${msg}`);
    return true;
  }
  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) Linking.openURL(url);
      else Alert.alert('SMS not available', 'Cannot open messaging app on this device.');
    })
    .catch(() => Alert.alert('Error', 'Failed to open messaging app.'));
  return true;
}
