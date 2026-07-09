# Keysor

**Keysor is the Agentic Keyboard** — create your own agentic workflows or use community ones, then trigger them directly from your keyboard.

Type an intent, hold the Keysor bar, and get the result written in place. Built for iOS with **Expo SDK 54** and a native **Custom Keyboard Extension** (`targets/keyboard`).

## Features

- **Agentic workflows from the keyboard** — long-press the Keysor bar (or a bound skill key) to run an automation without leaving the text field
- **Create your own skills** — describe a workflow in the Skill Builder and wire it into a key
- **Community skills** — browse and assign shared workflows (plan, reply, Notion capture, schedule, rewrite, and more)
- **Glass keyboard UI** — in-app QWERTY demo with skill bindings and haptic feedback
- **Setup / Full Access walkthrough** — interactive demo of Add Keyboard + Allow Full Access
- **Native Keyboard Extension** — real system keyboard target under `targets/keyboard` for Dev / TestFlight builds
- **AI integration via OpenAI-compatible APIs** — Skill Builder designs custom skills; set API key + base URL + model for OpenAI, Groq, OpenRouter, xAI, etc.

### Cursor handoff (demo)

Keysor can hand a phone triage prompt to the Cursor app via deeplink + clipboard (`cursor://…`). Full **Cursor SDK** integration is not wired yet — Expo does not support the Cursor SDK today. For in-app AI skills, open **Skill Builder → API** and paste key + base URL (stored on-device; Keysor has no backend).

### OpenAI-compatible Skill Builder

1. Open **Builder** → tap **API** → paste **API key**, **base URL**, and **model**.
   - OpenAI: `https://api.openai.com/v1` + `gpt-4o-mini`
   - Groq: `https://api.groq.com/openai/v1` + e.g. `llama-3.3-70b-versatile`
   - OpenRouter: `https://openrouter.ai/api/v1` + any routed model id
   - xAI: `https://api.x.ai/v1` + e.g. `grok-3` (requires credits)
2. Describe a Shortcuts-style skill (“rewrite this Slack ping as a calm customer reply and draft a Notion capture”).
3. When the draft looks right, tap **Deploy** — the skill is saved and bound to **R**.
4. On **Keyboard**, long-press **R** to run it against the text field via your provider.

## Tabs

1. **Setup** — interactive demo of Add Keyboard + Full Access
2. **Keyboard** — glass QWERTY + Keysor bar
3. **Skills** — assign / browse skill keys
4. **Builder** — describe a skill in chat
5. **Access** — claim lifetime early access

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
