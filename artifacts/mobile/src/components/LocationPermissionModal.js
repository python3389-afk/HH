import React from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  Dimensions, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLocation } from '../context/LocationContext';

const { width } = Dimensions.get('window');

export default function LocationPermissionModal() {
  const { colors, isDark } = useTheme();
  const { showPermissionModal, requestPermission, declinePermission } = useLocation();

  return (
    <Modal
      visible={showPermissionModal}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: isDark ? colors.surface : '#fff' }]}>
          <View style={[styles.iconCircle, { backgroundColor: isDark ? colors.primaryLight : '#eff6ff' }]}>
            <View style={[styles.iconInner, { backgroundColor: colors.primary }]}>
              <Ionicons name="location" size={36} color="#fff" />
            </View>
          </View>

          <Text style={[styles.title, { color: isDark ? colors.text : '#111827' }]}>
            Enable Location
          </Text>
          <Text style={[styles.body, { color: isDark ? colors.textSecondary : '#6b7280' }]}>
            For a better experience, allow OrderMe to use your location to find nearby service providers and show you relevant services in your area.
          </Text>

          <View style={[styles.featureRow, { backgroundColor: isDark ? colors.surfaceAlt : '#f9fafb', borderColor: isDark ? colors.border : '#f3f4f6' }]}>
            {[
              { icon: 'storefront-outline', label: 'Providers near you' },
              { icon: 'star-outline', label: 'Popular in your city' },
              { icon: 'time-outline', label: 'Faster bookings' },
            ].map((f) => (
              <View key={f.label} style={styles.feature}>
                <Ionicons name={f.icon} size={20} color={colors.primary} />
                <Text style={[styles.featureText, { color: isDark ? colors.textSecondary : '#4b5563' }]}>{f.label}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.allowBtn, { backgroundColor: colors.primary }]}
            onPress={requestPermission}
            activeOpacity={0.85}
          >
            <Ionicons name="location" size={18} color="#fff" />
            <Text style={styles.allowText}>Allow Location Access</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={declinePermission}>
            <Text style={[styles.skipText, { color: isDark ? colors.textSecondary : '#9ca3af' }]}>
              No thanks, skip for now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
  iconCircle: {
    width: 96, height: 96, borderRadius: 48,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  iconInner: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center',
  },
  title: {
    fontSize: 22, fontWeight: '800',
    marginBottom: 10, textAlign: 'center',
  },
  body: {
    fontSize: 14, lineHeight: 22,
    textAlign: 'center', marginBottom: 20,
  },
  featureRow: {
    width: '100%', borderRadius: 14,
    borderWidth: 1,
    padding: 14, gap: 12,
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  featureText: { fontSize: 13, fontWeight: '500' },
  allowBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    width: '100%', borderRadius: 14,
    paddingVertical: 15, justifyContent: 'center',
    marginBottom: 12,
  },
  allowText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  skipBtn: { paddingVertical: 8 },
  skipText: { fontSize: 14 },
});
