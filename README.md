# Keysor

An agentic iOS keyboard — type an intent, long-press a key, get the result in place.

Built with **Expo (SDK 57)** so you can run it on iPhone via Expo Go. Native Custom Keyboard Extension packaging can come later; this app is the product surface for early users.

## Run on iPhone

```bash
npm install
npx expo start
```

Scan the QR code with Camera / Expo Go.

## What you can do

1. Type into the message field (custom glass keyboard — system keyboard is suppressed).
2. **Long-press space** (or any skill key with a mark) to run its automation and replace the field in place.
3. **Long-press an unbound key** to assign Plan / Summarize / Notion / Schedule / Share spot / Rewrite.
4. Claim early-access lifetime access from the in-app CTA.

Bindings persist on device via AsyncStorage.

## Why Expo (not Next.js / Vite)

Keysor is an **iOS app**. Expo is the simplest path to a real React Native iPhone build in this environment. Next.js and Vite target the web.
