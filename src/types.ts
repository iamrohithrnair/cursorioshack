export type AutomationId =
  | 'cursor'
  | 'plan'
  | 'summarize'
  | 'notion'
  | 'schedule'
  | 'location'
  | 'rewrite';

export type Automation = {
  id: AutomationId;
  title: string;
  subtitle: string;
  letter: string;
  tint: string;
  downloads: string;
  creator: string;
  creatorSkills: string;
  run: (input: string) => string;
};

export type KeyBindings = Partial<Record<string, AutomationId>>;

export type TabId = 'setup' | 'keyboard' | 'skills' | 'builder' | 'access';
