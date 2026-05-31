---
name: OrderMe Expo setup
description: Key decisions and gotchas for the OrderMe React Native/Expo artifact
---

## Entry point
`main` in package.json must be `"./index.ts"` (not `expo-router/entry`). `index.ts` registers `App.tsx` via `registerRootComponent`.

## Navigation
The app uses React Navigation (`@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack`) — NOT expo-router. The `app/` scaffold directory is unused.

## Architecture requirement
`newArchEnabled: false` in app.json — Firebase auth is incompatible with the new React Native architecture.

## Logo asset path
`AppLogo.js` requires the logo via `../logo.png`, which resolves to `src/logo.png`. The file must live at `artifacts/mobile/src/logo.png`.

## All source files location
All downloaded Google Drive files live in `artifacts/mobile/src/` (screens, navigation, context, services, data, utils, hooks, theme, i18n).

**Why:** The Drive project used a flat `src/` structure, not the scaffold's `app/` router structure.

## Missing file that blocked startup
`src/data/seedCatalogRunner.js` was missing from first download batch but imported by `DataContext.js`. Always ensure this file exists (Drive file ID: 19b2TCFf4eg1DgkyfPfbdE7BIpnnetCOg).
