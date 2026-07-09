import type { Automation, AutomationId, KeyBindings } from './types';

function clean(input: string) {
  return input.trim() || 'your note';
}

export const AUTOMATIONS: Record<AutomationId, Automation> = {
  cursor: {
    id: 'cursor',
    title: 'Fix from phone',
    subtitle: 'Principles + bug → Cursor starts the fix',
    letter: 'C',
    tint: '#4B8CFF',
    downloads: '∞',
    creator: 'Keysor × Cursor',
    creatorSkills: '1 Skill',
    run: (input) => {
      const report = clean(input);
      return [
        '✦ Handed to Cursor',
        '',
        'Prompt includes your principles:',
        '• Follow YAGNI strictly',
        "• Chesterton's fence before deletions",
        '• Keep it super simple',
        '',
        'Then the bug:',
        report.split('\n').slice(0, 4).join('\n'),
        '',
        'Confirm in Cursor → agent investigates, patches, opens a PR.',
        'Laptop stays closed.',
      ].join('\n');
    },
  },
  plan: {
    id: 'plan',
    title: 'Instant Plan',
    subtitle: 'Turn intent into a short plan',
    letter: 'P',
    tint: '#4B8CFF',
    downloads: '18.2K',
    creator: 'Keysor Labs',
    creatorSkills: '12 Skills',
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
    title: 'Super Reply',
    subtitle: 'Compress text into a sharp reply',
    letter: 'R',
    tint: '#7C6CFF',
    downloads: '24.1K',
    creator: 'VisionaryAI',
    creatorSkills: '20 Skills',
    run: (input) => {
      const text = clean(input);
      const words = text.split(/\s+/).slice(0, 18).join(' ');
      return `Summary\n• ${words}${text.split(/\s+/).length > 18 ? '…' : ''}\n• Next: reply with the action you want taken`;
    },
  },
  notion: {
    id: 'notion',
    title: 'Notion Capture',
    subtitle: 'Format a capture for Notion',
    letter: 'N',
    tint: '#111111',
    downloads: '12.4K',
    creator: 'Workflow Club',
    creatorSkills: '9 Skills',
    run: (input) => {
      const note = clean(input);
      const stamp = new Date().toLocaleString();
      return `Notion capture\nTitle: ${note.slice(0, 48)}\nBody: ${note}\nTags: keysor, inbox\nLogged: ${stamp}`;
    },
  },
  schedule: {
    id: 'schedule',
    title: 'Instant Meet',
    subtitle: 'Draft a simple schedule',
    letter: 'G',
    tint: '#2BB673',
    downloads: '9.8K',
    creator: 'Calendar Crew',
    creatorSkills: '7 Skills',
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
    title: 'Address HUD',
    subtitle: 'Drop a quick location note',
    letter: 'A',
    tint: '#FF8A3D',
    downloads: '7.1K',
    creator: 'Local Layer',
    creatorSkills: '5 Skills',
    run: (input) => {
      const place = clean(input);
      return `I'm near ${place}. Meet here in 10? I'll share a pin if needed.`;
    },
  },
  rewrite: {
    id: 'rewrite',
    title: 'Post Rewriter',
    subtitle: 'Make it clearer and warmer',
    letter: 'W',
    tint: '#E4578C',
    downloads: '15.6K',
    creator: 'Copy Desk',
    creatorSkills: '14 Skills',
    run: (input) => {
      const text = clean(input);
      return `Quick rewrite:\n"${text}"\n\nClearer version:\nHey — ${text.replace(/^[a-z]/, (c) => c.toUpperCase())}. Let me know what works.`;
    },
  },
};

export const AUTOMATION_LIST = Object.values(AUTOMATIONS);

/** Space bar is locked to Cursor handoff for the phone-triage demo. */
export const DEFAULT_BINDINGS: KeyBindings = {
  ' ': 'cursor',
  q: 'summarize',
  w: 'notion',
  e: 'schedule',
  a: 'location',
  s: 'rewrite',
  p: 'plan',
};

export function runAutomation(id: AutomationId, input: string) {
  return AUTOMATIONS[id].run(input);
}
