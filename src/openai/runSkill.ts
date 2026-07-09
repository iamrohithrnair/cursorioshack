import { createOpenAIClient, formatOpenAIError, MissingOpenAIKeyError } from './client';
import type { CustomSkill } from '../types';

export type SkillRunResult = {
  text: string;
  source: 'openai' | 'template' | 'error';
  error?: string;
};

const RUN_SYSTEM = `You are Keysor, an agentic keyboard skill runner.
The user triggered a custom skill from their keyboard with the text currently in the field.
Follow the skill instructions exactly. Return ONLY the final text to insert into the field — no preamble, no markdown fences unless the skill asks for them.`;

export async function runCustomSkillWithOpenAI(
  skill: CustomSkill,
  input: string,
): Promise<SkillRunResult> {
  const field = input.trim() || '(empty field)';
  const integrationBlock =
    skill.integrations.length > 0
      ? `\nIntegrations this skill may reference (Shortcuts-style):\n${skill.integrations
          .map((i) => `- ${i.label}: ${i.role}`)
          .join('\n')}`
      : '';

  try {
    const { client, config } = await createOpenAIClient();
    const completion = await client.chat.completions.create({
      model: config.model,
      temperature: 0.4,
      messages: [
        { role: 'system', content: RUN_SYSTEM },
        {
          role: 'user',
          content: [
            `Skill: ${skill.title}`,
            `Goal: ${skill.subtitle}`,
            `Instructions:\n${skill.instructions}`,
            skill.outputHint ? `Output shape:\n${skill.outputHint}` : '',
            integrationBlock,
            '',
            `Keyboard field text:\n${field}`,
          ]
            .filter(Boolean)
            .join('\n'),
        },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) {
      return {
        text: fallbackCustomSkill(skill, field),
        source: 'error',
        error: 'OpenAI returned an empty response.',
      };
    }
    return { text, source: 'openai' };
  } catch (error) {
    if (error instanceof MissingOpenAIKeyError) {
      return {
        text: fallbackCustomSkill(skill, field),
        source: 'template',
        error: error.message,
      };
    }
    return {
      text: fallbackCustomSkill(skill, field),
      source: 'error',
      error: formatOpenAIError(error),
    };
  }
}

function fallbackCustomSkill(skill: CustomSkill, field: string): string {
  const integrations =
    skill.integrations.length > 0
      ? `\nIntegrations: ${skill.integrations.map((i) => i.label).join(', ')}`
      : '';
  return [
    `✦ ${skill.title}`,
    skill.subtitle,
    '',
    skill.instructions,
    integrations,
    '',
    `Input: ${field}`,
    '',
    '(Add an OpenAI API key in Skill Builder to run this skill with AI.)',
  ].join('\n');
}
