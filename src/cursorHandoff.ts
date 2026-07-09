import { Linking } from 'react-native';

/**
 * Real away-from-laptop problem:
 * You get a Slack / CI / review ping on your phone and can't open the laptop.
 * Keysor turns that pasted message into a Cursor agent that starts the fix.
 */
export function buildCursorPrompt(intent: string) {
  const report = intent.trim() || 'Investigate the latest failing CI on main.';
  return [
    'I am away from my laptop. I pasted this from Slack / CI / review on my iPhone via Keysor.',
    '',
    'Incident / request:',
    '"""',
    report,
    '"""',
    '',
    'Please:',
    '1. Triage: what broke, where, and how serious',
    '2. Find the root cause in the repo',
    '3. Implement the smallest safe fix',
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
