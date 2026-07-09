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
5. Reply with ONLY a single JSON object. No markdown fences. No prose before or after. Shape:
{
  "message": "friendly chat reply to show the user",
  "readyToDeploy": true,
  "draft": {
    "title": "short skill name",
    "subtitle": "one-line what it does",
    "instructions": "detailed instructions the model will follow when the skill runs",
    "outputHint": "optional example of the inserted text shape",
    "integrations": [{ "id": "notion", "label": "Notion", "role": "append capture to Inbox" }]
  }
}
If you still need clarification, set "readyToDeploy" to false and "draft" to null.
6. Set readyToDeploy true only when title, subtitle, and instructions are solid.
7. Keep message concise (2–4 sentences).`;

function contentToText(content: unknown): string {
  if (typeof content === 'string') return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part && typeof part === 'object') {
          const row = part as Record<string, unknown>;
          if (typeof row.text === 'string') return row.text;
          if (typeof row.content === 'string') return row.content;
        }
        return '';
      })
      .filter(Boolean)
      .join('\n')
      .trim();
  }
  if (content == null) return '';
  return String(content).trim();
}

function stripMarkdownFences(raw: string): string {
  let text = raw.trim();
  // ```json ... ``` or ``` ... ```
  const fenced = text.match(/^```(?:json|JSON)?\s*([\s\S]*?)\s*```$/);
  if (fenced) return fenced[1].trim();
  text = text.replace(/^```(?:json|JSON)?\s*/i, '').replace(/\s*```$/i, '');
  return text.trim();
}

function extractJsonObject(raw: string): Record<string, unknown> | null {
  const cleaned = stripMarkdownFences(raw);
  if (!cleaned) return null;

  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // fall through to brace scan
  }

  // Find the outermost { ... } even if the model added prose around it.
  const start = cleaned.indexOf('{');
  if (start < 0) return null;

  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (inString) {
      if (escape) {
        escape = false;
      } else if (ch === '\\') {
        escape = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        try {
          const parsed = JSON.parse(cleaned.slice(start, i + 1));
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return parsed as Record<string, unknown>;
          }
        } catch {
          return null;
        }
      }
    }
  }
  return null;
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

/** Some models put draft fields at the top level instead of under "draft". */
function coerceParsedResult(parsed: Record<string, unknown>, rawFallback: string): BuilderTurnResult {
  const nestedDraft = normalizeDraft(parsed.draft);
  const topLevelDraft =
    nestedDraft ??
    normalizeDraft({
      title: parsed.title,
      subtitle: parsed.subtitle,
      instructions: parsed.instructions,
      outputHint: parsed.outputHint,
      integrations: parsed.integrations,
    });

  const assistantText =
    String(parsed.message ?? parsed.reply ?? parsed.response ?? '').trim() ||
    (topLevelDraft
      ? `Drafted “${topLevelDraft.title}”. Review it and tap Deploy when ready.`
      : rawFallback.trim() || 'Here’s a skill draft based on what you described.');

  const readyFlag = parsed.readyToDeploy;
  const readyToDeploy =
    typeof readyFlag === 'boolean'
      ? readyFlag && !!topLevelDraft
      : !!topLevelDraft;

  return { assistantText, draft: topLevelDraft, readyToDeploy };
}

function plainTextFallback(raw: string): BuilderTurnResult {
  const text = raw.trim();
  if (!text) {
    return {
      assistantText: 'The model returned an empty reply. Try again, or switch model.',
      draft: null,
      readyToDeploy: false,
      error: 'Empty model response.',
    };
  }
  // Show the model's prose so the chat still works on providers that ignore JSON mode.
  return {
    assistantText: text,
    draft: null,
    readyToDeploy: false,
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

async function createBuilderCompletion(
  client: Awaited<ReturnType<typeof createOpenAIClient>>['client'],
  model: string,
  messages: BuilderChatMessage[],
  useJsonMode: boolean,
) {
  return client.chat.completions.create({
    model,
    temperature: 0.4,
    ...(useJsonMode ? { response_format: { type: 'json_object' as const } } : {}),
    messages: [
      ...messages,
      // Extra nudge helps providers that ignore response_format.
      ...(useJsonMode
        ? []
        : [
            {
              role: 'user' as const,
              content:
                'Respond with ONLY the JSON object described in the system prompt. No markdown.',
            },
          ]),
    ],
  });
}

function shouldRetryWithoutJsonMode(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes('response_format') ||
    msg.includes('json_object') ||
    msg.includes('json mode') ||
    msg.includes('not supported') ||
    msg.includes('unknown parameter') ||
    msg.includes('invalid_request')
  );
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

    let completion;
    try {
      completion = await createBuilderCompletion(client, config.model, messages, true);
    } catch (error) {
      if (!shouldRetryWithoutJsonMode(error)) throw error;
      completion = await createBuilderCompletion(client, config.model, messages, false);
    }

    const raw = contentToText(completion.choices[0]?.message?.content);
    const parsed = extractJsonObject(raw);
    if (parsed) {
      return coerceParsedResult(parsed, raw);
    }

    // Provider returned prose / partial JSON — still show it in chat instead of hard-failing.
    return plainTextFallback(raw);
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
