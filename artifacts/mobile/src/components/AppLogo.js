import React from 'react';
import { Image, StyleSheet } from 'react-native';

const LOGO = require('../logo.png');

const SIZES = {
  small:   { height: 28,  width: 112 },
  medium:  { height: 38,  width: 152 },
  large:   { height: 52,  width: 208 },
  hero:    { height: 72,  width: 288 },
  xlarge:  { height: 90,  width: 360 },
};

export default function AppLogo({ size = 'medium', style }) {
  const dimensions = SIZES[size] || SIZES.medium;
  return (
    <Image
      source={LOGO}
      style={[styles.logo, dimensions, style]}
      resizeMode="contain"
      accessibilityLabel="OrderMe logo"
    />
  );
}

const styles = StyleSheet.create({
  logo: {},
});
