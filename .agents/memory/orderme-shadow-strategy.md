---
name: OrderMe Shadow Strategy
description: How platform-safe shadows are handled in this project
---

## Rule
Never spread raw `shadow*` props into StyleSheets on web. Use `makeShadow()` from `src/utils/shadows.js` or guard with `Platform.OS !== 'web'`.

## Why
React Native Web logs a deprecation warning for `shadowColor`, `shadowOffset`, etc. The correct web equivalent is CSS `boxShadow`.

## How to apply
- `src/utils/shadows.js` — exports `makeShadow()` and pre-built `PLATFORM_SHADOWS` / `PLATFORM_SHADOWS_DARK`
- `src/theme/themes.js` — uses `PLATFORM_SHADOWS` and `PLATFORM_SHADOWS_DARK` for the `shadows` object
- `src/theme/colors.js` — inline `makeShadow()` for the exported `SHADOWS` object
- For one-off inline shadows (e.g. TabNavigator map icon): use `Platform.OS === 'web' ? { boxShadow: '...' } : { shadowColor: ..., ... }`
- For new screens (LoginScreen, RegisterScreen): wrap shadow props in `...(Platform.OS !== 'web' ? { shadowColor: ... } : {})`
