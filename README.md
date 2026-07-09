# Keysor

An agentic iOS keyboard — type an intent, hold the Keysor bar, get the result in place.

Built with **Expo SDK 54** + a native **Custom Keyboard Extension** (`targets/keyboard`).

## Important: Expo Go vs real keyboard

| Mode | What you get |
| --- | --- |
| **Expo Go** | In-app glass keyboard demo + **Enable Keysor** setup walkthrough (Add Keyboard + Full Access) |
| **Dev / TestFlight build** | Real iOS system keyboard that appears under Settings → Keyboards and asks for Full Access |

iOS only shows the Add Keyboard / Full Access permission after the app is installed with its Keyboard Extension target. Expo Go cannot host that extension.

## Run in Expo Go (phone demo)

```bash
npm install
npx expo start --tunnel
```

Open the `exp://…` URL in Expo Go 54. Use the **Setup** tab to rehearse enabling the keyboard + Full Access.

## Install as a real iOS keyboard (Mac + Xcode / EAS)

```bash
npm install
npx expo prebuild -p ios --clean
# open in Xcode, sign app + KeysorKeyboard extension, run on device
xed ios
```

Or with EAS:

```bash
npx eas build -p ios --profile development
```

Then on the iPhone:

1. Settings → General → Keyboard → Keyboards  
2. Add New Keyboard… → **Keysor**  
3. Keysor → **Allow Full Access** → Allow  
4. In any text field, hold 🌐 and choose Keysor  
5. Hold the **Keysor** bar to run an automation  

## Tabs

1. **Setup** — interactive demo of Add Keyboard + Full Access  
2. **Keyboard** — glass QWERTY + Keysor bar  
3. **Skills** — assign / browse skill keys  
4. **Builder** — describe a skill in chat  
5. **Access** — claim lifetime early access  
