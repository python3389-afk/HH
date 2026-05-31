---
name: OrderMe Web Warning Suppression
description: How to suppress React Native Web cosmetic warnings in this project
---

## Rule
Use a `console.warn` override in `index.ts` (the very first file executed), NOT `LogBox.ignoreLogs`.

## Why
`LogBox.ignoreLogs` runs too late — RNW fires `shadow*`, `pointerEvents`, and `useNativeDriver` warnings synchronously during `StyleSheet.create()` at module initialization time, before LogBox can intercept them. The console.warn override in index.ts runs first.

## How to apply
In `artifacts/mobile/index.ts`, check `Platform.OS === 'web'` and replace `console.warn` with a filtered version. Known suppressed messages:
- `"shadow*" style props are deprecated`
- `props.pointerEvents is deprecated`
- `\`useNativeDriver\` is not supported`
- `The Geocoding API has been removed`
