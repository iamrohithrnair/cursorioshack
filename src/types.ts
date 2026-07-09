export type AutomationId =
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
  emoji: string;
  run: (input: string) => string;
};

export type KeyBindings = Partial<Record<string, AutomationId>>;
