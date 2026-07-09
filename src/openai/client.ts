import OpenAI from 'openai';
import { loadOpenAIConfig, type OpenAIConfig } from './config';

export class MissingOpenAIKeyError extends Error {
  constructor() {
    super('Add an OpenAI API key in Skill Builder to design and run AI skills.');
    this.name = 'MissingOpenAIKeyError';
  }
}

export async function getOpenAIConfig(): Promise<OpenAIConfig> {
  return loadOpenAIConfig();
}

export async function createOpenAIClient(config?: OpenAIConfig): Promise<{
  client: OpenAI;
  config: OpenAIConfig;
}> {
  const resolved = config ?? (await loadOpenAIConfig());
  if (!resolved.apiKey) {
    throw new MissingOpenAIKeyError();
  }

  // Expo / React Native is treated like a browser runtime by the SDK.
  // Key lives on-device (AsyncStorage) because Keysor has no backend.
  const client = new OpenAI({
    apiKey: resolved.apiKey,
    baseURL: resolved.baseURL,
    dangerouslyAllowBrowser: true,
  });

  return { client, config: resolved };
}

export function formatOpenAIError(error: unknown): string {
  if (error instanceof MissingOpenAIKeyError) return error.message;
  if (error instanceof OpenAI.APIError) {
    if (error.status === 401) return 'OpenAI rejected the API key. Check it in Skill Builder.';
    if (error.status === 429) return 'OpenAI rate limit hit — try again in a moment.';
    return error.message || 'OpenAI request failed.';
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong talking to OpenAI.';
}
