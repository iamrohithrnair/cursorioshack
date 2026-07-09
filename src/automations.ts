import type { Automation, AutomationId, KeyBindings } from './types';

function clean(input: string) {
  return input.trim() || 'your note';
}

export const AUTOMATIONS: Record<AutomationId, Automation> = {
  plan: {
    id: 'plan',
    title: 'Plan',
    subtitle: 'Turn intent into a short plan',
    emoji: '✦',
    run: (input) => {
      const topic = clean(input);
      return [
        `Plan for: ${topic}`,
        '',
        '1. Confirm date, time, and guests',
        '2. Pick venue / stream setup',
        '3. Send invites with a clear RSVP ask',
        '4. Prep snacks + reminders day-of',
      ].join('\n');
    },
  },
  summarize: {
    id: 'summarize',
    title: 'Summarize',
    subtitle: 'Compress text into bullets',
    emoji: '◎',
    run: (input) => {
      const text = clean(input);
      const words = text.split(/\s+/).slice(0, 18).join(' ');
      return `Summary\n• ${words}${text.split(/\s+/).length > 18 ? '…' : ''}\n• Next: reply with the action you want taken`;
    },
  },
  notion: {
    id: 'notion',
    title: 'Log to Notion',
    subtitle: 'Format a capture for Notion',
    emoji: '◇',
    run: (input) => {
      const note = clean(input);
      const stamp = new Date().toLocaleString();
      return `Notion capture\nTitle: ${note.slice(0, 48)}\nBody: ${note}\nTags: keysor, inbox\nLogged: ${stamp}`;
    },
  },
  schedule: {
    id: 'schedule',
    title: 'Schedule',
    subtitle: 'Draft a simple schedule',
    emoji: '◷',
    run: (input) => {
      const topic = clean(input);
      return [
        `Schedule: ${topic}`,
        '09:00 Focus block',
        '11:00 Check-ins',
        '13:00 Deep work',
        '16:00 Wrap + send updates',
      ].join('\n');
    },
  },
  location: {
    id: 'location',
    title: 'Share spot',
    subtitle: 'Drop a quick location note',
    emoji: '⌖',
    run: (input) => {
      const place = clean(input);
      return `I'm near ${place}. Meet here in 10? I'll share a pin if needed.`;
    },
  },
  rewrite: {
    id: 'rewrite',
    title: 'Rewrite',
    subtitle: 'Make it clearer and warmer',
    emoji: '✎',
    run: (input) => {
      const text = clean(input);
      return `Quick rewrite:\n"${text}"\n\nClearer version:\nHey — ${text.replace(/^[a-z]/, (c) => c.toUpperCase())}. Let me know what works.`;
    },
  },
};

export const AUTOMATION_LIST = Object.values(AUTOMATIONS);

export const DEFAULT_BINDINGS: KeyBindings = {
  ' ': 'plan',
  q: 'summarize',
  w: 'notion',
  e: 'schedule',
  a: 'location',
  s: 'rewrite',
};

export function runAutomation(id: AutomationId, input: string) {
  return AUTOMATIONS[id].run(input);
}
