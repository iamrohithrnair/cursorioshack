import * as Clipboard from 'expo-clipboard';
import { Linking, Platform } from 'react-native';

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

function promptUrl(base: string, prompt: string) {
  // Manual encode — more reliable than URL() for custom schemes in RN.
  return `${base}?text=${encodeURIComponent(prompt)}`;
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

  // Copy first so paste works even if the deeplink drops the query on iOS.
  let copied = false;
  try {
    await Clipboard.setStringAsync(prompt);
    copied = true;
    // Give iOS a beat to commit the pasteboard before switching apps.
    await sleep(120);
  } catch {
    copied = false;
  }

  const webUrl = promptUrl('https://cursor.com/link/prompt', prompt);
  const nativeUrl = promptUrl('cursor://anysphere.cursor-deeplink/prompt', prompt);

  // iOS: prefer the https universal link — it reliably hands text into Cursor.
  // Native scheme often opens the app but drops ?text= on mobile.
  const candidates =
    Platform.OS === 'ios' ? [webUrl, nativeUrl] : [nativeUrl, webUrl];

  for (const url of candidates) {
    // Do not gate on canOpenURL — long custom-scheme URLs often return false on iOS.
    if (await tryOpen(url)) {
      return { opened: true, prompt, copied, url };
    }
  }

  // Last resort: open Cursor / agents home; prompt is already on clipboard.
  if (await tryOpen('https://cursor.com/agents')) {
    return { opened: true, prompt, copied, url: 'https://cursor.com/agents' };
  }

  return { opened: false, prompt, copied, url: webUrl };
}
