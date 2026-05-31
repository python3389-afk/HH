import { Platform } from 'react-native';

/**
 * Returns platform-appropriate shadow styles.
 * On web, uses CSS boxShadow to avoid the deprecated shadow* props warning.
 * On native (iOS/Android), uses the standard RN shadow props + elevation.
 */
export function makeShadow(color, offset, opacity, radius, elevation) {
  if (Platform.OS === 'web') {
    const { width: x, height: y } = offset;
    const blur = radius;
    return { boxShadow: `${x}px ${y}px ${blur}px rgba(0,0,0,${opacity * 0.6})` };
  }
  return {
    shadowColor: color,
    shadowOffset: offset,
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
}

export const PLATFORM_SHADOWS = {
  sm:   makeShadow('#1a56db', { width: 0, height: 2 },  0.08, 4,  2),
  md:   makeShadow('#1a56db', { width: 0, height: 4 },  0.12, 8,  4),
  lg:   makeShadow('#000000', { width: 0, height: 8 },  0.12, 16, 8),
  card: makeShadow('#1a56db', { width: 0, height: 4 },  0.10, 12, 5),
};

export const PLATFORM_SHADOWS_DARK = {
  sm:   makeShadow('#38bdf8', { width: 0, height: 2 },  0.15, 6,  3),
  md:   makeShadow('#000000', { width: 0, height: 4 },  0.35, 10, 6),
  lg:   makeShadow('#000000', { width: 0, height: 8 },  0.45, 20, 10),
  card: makeShadow('#38bdf8', { width: 0, height: 4 },  0.12, 14, 6),
};
