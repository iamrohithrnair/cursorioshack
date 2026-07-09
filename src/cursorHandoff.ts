import { Linking } from 'react-native';

/** Principles prepended to every phone → Cursor handoff. */
export const DEV_PRINCIPLES = [
  'Follow YAGNI strictly — only build what this incident needs.',
  "Before any deletions, apply Chesterton's fence: understand why the code exists before removing or rewriting it.",
  'Keep the fix super simple — smallest safe change, no drive-by refactors.',
].join('\n');

/**
 * Real away-from-laptop problem:
 * Slack / CI / review ping on your phone → Cursor starts the fix with your principles baked in.
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

export async function sendToCursorApp(intent: string): Promise<{ opened: boolean; prompt: string }> {
  const prompt = buildCursorPrompt(intent);
  const encoded = encodeURIComponent(prompt);

  const candidates = [
    `cursor://anysphere.cursor-deeplink/prompt?text=${encoded}`,
    `https://cursor.com/link/prompt?text=${encoded}`,
    'https://cursor.com/agents',
  ];

  for (const url of candidates) {
    try {
      await Linking.openURL(url);
      return { opened: true, prompt };
    } catch {
      // try next
    }
  }

  return { opened: false, prompt };
}
