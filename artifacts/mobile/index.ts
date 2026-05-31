import { Platform } from 'react-native';

// Filter known web-only cosmetic warnings before any module initializes.
// These never appear on native — LogBox alone doesn't suppress RNW's own console.warn.
if (Platform.OS === 'web') {
  const IGNORED = [
    '"shadow*" style props are deprecated',
    'props.pointerEvents is deprecated',
    '`useNativeDriver` is not supported',
    'Animated: `useNativeDriver`',
    'The Geocoding API has been removed',
  ];
  const _warn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    if (IGNORED.some((s) => msg.includes(s))) return;
    _warn(...args);
  };
}

import { registerRootComponent } from 'expo';
import App from './App';
registerRootComponent(App);
