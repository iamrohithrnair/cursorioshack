/** Sample Slack/CI ping developers actually get while away from their laptop. */
export const INCIDENT_DEMO = [
  'Slack · #eng-alerts · 7:12 PM',
  '',
  '@rohith CI failed on main after merge of #482',
  'Job: iOS Expo typecheck',
  'Error: Property absoluteFillObject does not exist on StyleSheet (GlassKey.tsx)',
  'Blocking tonight’s TestFlight cut.',
  'Can you take a look? Laptop not with me.',
].join('\n');

/** Shown in-app so the demo makes the principles visible before handoff. */
export const PRINCIPLES_PREVIEW = [
  'Follow YAGNI strictly',
  "Before deletions → Chesterton's fence",
  'Keep it super simple',
].join(' · ');
