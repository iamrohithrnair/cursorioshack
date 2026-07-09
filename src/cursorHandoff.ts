import * as Clipboard from 'expo-clipboard';
import { Linking } from 'react-native';

/** Principles prepended to every phone → Cursor handoff. */
export const DEV_PRINCIPLES = [
  'Follow YAGNI strictly - only build what this incident needs.',
  "Before any deletions, apply Chesterton's fence: understand why the code exists before removing or rewriting it.",
  'Keep the fix super simple - smallest safe change, no drive-by refactors.',
].join('\n');

/**
 * Away-from-laptop triage:
 * Slack / CI ping on phone → Cursor gets principles first, then the bug.
 */
export function buildCursorPrompt(intent: string) {
  const report = intent.trim() || 'Investigate the latest failing CI on main.';
  return [
    'I am away from my laptop. I pasted this from Slack / CI / review on my iPhone via Keysor.',
    '',
    '## My principles (follow these)',
    DEV_PRINCIPLES,
    '',
    '## The bug / incident',
    '"""',
    report,
    '"""',
    '',
    '## What to do',
    '1. Triage: what broke, where, and how serious',
    '2. Find the root cause in the repo',
    '3. Implement the smallest safe fix (YAGNI + Chesterton\'s fence)',
    '4. Open or update a PR with a clear summary + how to verify',
    '5. Reply with status I can skim on my phone',
    '',
    'Do not wait for me to get back to my desk. Bias to a mergeable fix.',
  ].join('\n');
}

/** Cursor's deeplink parser rejects some unicode; keep ASCII-safe for the URL. */
function sanitizeForDeeplink(prompt: string) {
  return prompt
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014\u2212]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ')
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '');
}

function promptUrl(prompt: string) {
  // Native scheme only — opens the Cursor app directly, not Safari.
  return `cursor://anysphere.cursor-deeplink/prompt?text=${encodeURIComponent(prompt)}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tryOpen(url: string): Promise<boolean> {
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}

export async function sendToCursorApp(intent: string): Promise<{
  opened: boolean;
  prompt: string;
  copied: boolean;
  url: string;
}> {
  const prompt = sanitizeForDeeplink(buildCursorPrompt(intent));
  const nativePromptUrl = promptUrl(prompt);

  // Copy first so paste works if the app opens without prefilled text.
  let copied = false;
  try {
    await Clipboard.setStringAsync(prompt);
    copied = true;
    // Give iOS a beat to commit the pasteboard before switching apps.
    await sleep(120);
  } catch {
    copied = false;
  }

  // Open Cursor app only (cursor://). Never use https:// — that lands in Safari.
  // Do not gate on canOpenURL — long custom-scheme URLs often return false on iOS
  // even when the Cursor app is installed and can handle the link.
  const candidates = [
    nativePromptUrl,
    // Shorter prompt URL if the full one fails to hand off.
    `cursor://anysphere.cursor-deeplink/prompt?text=${encodeURIComponent(
      sanitizeForDeeplink(
        [
          DEV_PRINCIPLES,
          '',
          intent.trim() || 'Investigate the latest failing CI on main.',
        ].join('\n'),
      ),
    )}`,
    // Last resort: just launch the Cursor app; prompt is on the clipboard.
    'cursor://',
  ];

  for (const url of candidates) {
    if (await tryOpen(url)) {
      return { opened: true, prompt, copied, url };
    }
  }

  return { opened: false, prompt, copied, url: nativePromptUrl };
}
