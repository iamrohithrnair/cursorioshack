import OpenAI from 'openai';
import { loadOpenAIConfig, type OpenAIConfig } from './config';

export class MissingOpenAIKeyError extends Error {
  constructor() {
    super(
      'Add an API key (and optional base URL) in Skill Builder → API to use any OpenAI-compatible model.',
    );
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
  // Key + base URL live on-device (AsyncStorage) because Keysor has no backend.
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
    if (error.status === 401) {
      return 'Provider rejected the API key. Check key + base URL in Skill Builder → API.';
    }
    if (error.status === 404) {
      return 'Model or endpoint not found. Check model id and base URL (usually ends in /v1).';
    }
    if (error.status === 429) return 'Provider rate limit hit — try again in a moment.';
    return error.message || 'Model request failed.';
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong talking to the model provider.';
}
