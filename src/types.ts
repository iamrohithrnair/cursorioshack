export type BuiltinAutomationId =
  | 'cursor'
  | 'plan'
  | 'summarize'
  | 'notion'
  | 'schedule'
  | 'location'
  | 'rewrite';

/** Built-in ids plus custom skill ids like `custom_…`. */
export type AutomationId = BuiltinAutomationId | (string & {});
export type SkillId = AutomationId;

export type Automation = {
  id: AutomationId;
  title: string;
  subtitle: string;
  letter: string;
  tint: string;
  downloads: string;
  creator: string;
  creatorSkills: string;
  /** Sync template used when OpenAI is unavailable or for Cursor receipt. */
  run: (input: string) => string;
};

export type CustomSkillIntegration = {
  id: string;
  label: string;
  /** What the skill does with this integration (Shortcuts-style). */
  role: string;
};

export type CustomSkill = {
  id: SkillId;
  title: string;
  subtitle: string;
  letter: string;
  tint: string;
  /** System-style instructions the model follows when the skill runs. */
  instructions: string;
  /** Optional example of ideal output shape. */
  outputHint?: string;
  integrations: CustomSkillIntegration[];
  createdAt: string;
  updatedAt: string;
};

export type KeyBindings = Partial<Record<string, AutomationId>>;

export type TabId = 'setup' | 'keyboard' | 'skills' | 'builder' | 'access';

export const BUILTIN_AUTOMATION_IDS: BuiltinAutomationId[] = [
  'cursor',
  'plan',
  'summarize',
  'notion',
  'schedule',
  'location',
  'rewrite',
];

export function isBuiltinAutomationId(id: string): id is BuiltinAutomationId {
  return (BUILTIN_AUTOMATION_IDS as string[]).includes(id);
}
