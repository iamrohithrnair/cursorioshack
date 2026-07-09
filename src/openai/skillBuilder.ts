import { createOpenAIClient, formatOpenAIError, MissingOpenAIKeyError } from './client';
import {
  createCustomSkillId,
  letterFromTitle,
  tintForIndex,
} from '../customSkills';
import type { CustomSkill, CustomSkillIntegration } from '../types';

export type BuilderChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type BuilderDraft = {
  title: string;
  subtitle: string;
  instructions: string;
  outputHint?: string;
  integrations: CustomSkillIntegration[];
};

export type BuilderTurnResult = {
  assistantText: string;
  draft: BuilderDraft | null;
  readyToDeploy: boolean;
  error?: string;
};

const BUILDER_SYSTEM = `You are Keysor Skill Builder — an intelligent Shortcuts-style designer for an agentic iOS keyboard.

Help the user invent custom keyboard skills. A skill runs when they long-press a key: it reads the text field, optionally uses named integrations (Notion, Gmail, Calendar, Slack, Clipboard, URL, etc.), and writes a result back in place.

Rules:
1. Ask short clarifying questions when the request is vague (input, output, integrations).
2. Prefer concrete, runnable skills over vague "AI magic".
3. Integrations are declarative labels + roles (no real OAuth in this demo). Invent sensible ones the user can wire later.
4. When you have enough detail, propose a skill draft the app can deploy.
5. Always respond with a single JSON object (no markdown fences) of this shape:
{
  "message": "friendly chat reply to show the user",
  "readyToDeploy": true|false,
  "draft": null | {
    "title": "short skill name",
    "subtitle": "one-line what it does",
    "instructions": "detailed instructions the model will follow when the skill runs",
    "outputHint": "optional example of the inserted text shape",
    "integrations": [{ "id": "notion", "label": "Notion", "role": "append capture to Inbox" }]
  }
}
6. Set readyToDeploy true only when title, subtitle, and instructions are solid.
7. Keep message concise (2–4 sentences).`;

function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error('Model did not return JSON.');
  }
}

function normalizeIntegrations(value: unknown): CustomSkillIntegration[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      const label = String(row.label ?? row.name ?? '').trim();
      if (!label) return null;
      const id = String(row.id ?? label.toLowerCase().replace(/\s+/g, '_')).trim() || `int_${index}`;
      const role = String(row.role ?? row.description ?? 'Use when relevant').trim();
      return { id, label, role };
    })
    .filter((x): x is CustomSkillIntegration => !!x);
}

function normalizeDraft(value: unknown): BuilderDraft | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  const title = String(row.title ?? '').trim();
  const subtitle = String(row.subtitle ?? '').trim();
  const instructions = String(row.instructions ?? '').trim();
  if (!title || !instructions) return null;
  const outputHint = String(row.outputHint ?? '').trim();
  return {
    title,
    subtitle: subtitle || 'Custom Keysor skill',
    instructions,
    outputHint: outputHint || undefined,
    integrations: normalizeIntegrations(row.integrations),
  };
}

export function draftToCustomSkill(
  draft: BuilderDraft,
  existing?: CustomSkill | null,
  skillCount = 0,
): CustomSkill {
  const now = new Date().toISOString();
  return {
    id: existing?.id ?? createCustomSkillId(),
    title: draft.title,
    subtitle: draft.subtitle,
    letter: letterFromTitle(draft.title),
    tint: existing?.tint ?? tintForIndex(skillCount),
    instructions: draft.instructions,
    outputHint: draft.outputHint,
    integrations: draft.integrations,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export async function runSkillBuilderTurn(params: {
  history: BuilderChatMessage[];
  userText: string;
}): Promise<BuilderTurnResult> {
  try {
    const { client, config } = await createOpenAIClient();
    const messages: BuilderChatMessage[] = [
      { role: 'system', content: BUILDER_SYSTEM },
      ...params.history.filter((m) => m.role !== 'system'),
      { role: 'user', content: params.userText },
    ];

    const completion = await client.chat.completions.create({
      model: config.model,
      temperature: 0.5,
      response_format: { type: 'json_object' },
      messages,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? '';
    const parsed = extractJsonObject(raw) as Record<string, unknown>;
    const assistantText =
      String(parsed.message ?? '').trim() ||
      'Here’s a skill draft based on what you described.';
    const draft = normalizeDraft(parsed.draft);
    const readyToDeploy = Boolean(parsed.readyToDeploy) && !!draft;

    return { assistantText, draft, readyToDeploy };
  } catch (error) {
    if (error instanceof MissingOpenAIKeyError) {
      return {
        assistantText: error.message,
        draft: null,
        readyToDeploy: false,
        error: error.message,
      };
    }
    const message = formatOpenAIError(error);
    return {
      assistantText: message,
      draft: null,
      readyToDeploy: false,
      error: message,
    };
  }
}
