import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY_STORAGE = 'keysor.openai.apiKey.v1';
const MODEL_STORAGE = 'keysor.openai.model.v1';
const BASE_URL_STORAGE = 'keysor.openai.baseUrl.v1';

export const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';
export const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';

export type OpenAIConfig = {
  apiKey: string;
  model: string;
  baseURL: string;
};

function envApiKey(): string {
  // Optional local demo seed only — prefer the in-app key field for real use.
  return (process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '').trim();
}

function envModel(): string {
  return (process.env.EXPO_PUBLIC_OPENAI_MODEL ?? '').trim() || DEFAULT_OPENAI_MODEL;
}

function envBaseURL(): string {
  return (process.env.EXPO_PUBLIC_OPENAI_BASE_URL ?? '').trim() || DEFAULT_OPENAI_BASE_URL;
}

export async function loadOpenAIConfig(): Promise<OpenAIConfig> {
  try {
    const [storedKey, storedModel, storedBase] = await Promise.all([
      AsyncStorage.getItem(API_KEY_STORAGE),
      AsyncStorage.getItem(MODEL_STORAGE),
      AsyncStorage.getItem(BASE_URL_STORAGE),
    ]);
    return {
      apiKey: (storedKey ?? '').trim() || envApiKey(),
      model: (storedModel ?? '').trim() || envModel(),
      baseURL: normalizeOpenAIBaseURL((storedBase ?? '').trim() || envBaseURL()),
    };
  } catch {
    return {
      apiKey: envApiKey(),
      model: envModel(),
      baseURL: normalizeOpenAIBaseURL(envBaseURL()),
    };
  }
}

export async function saveOpenAIApiKey(apiKey: string) {
  const next = apiKey.trim();
  if (!next) {
    await AsyncStorage.removeItem(API_KEY_STORAGE);
    return;
  }
  await AsyncStorage.setItem(API_KEY_STORAGE, next);
}

export async function saveOpenAIModel(model: string) {
  const next = model.trim() || DEFAULT_OPENAI_MODEL;
  await AsyncStorage.setItem(MODEL_STORAGE, next);
}

/** Normalize provider base URLs for the OpenAI SDK (trim, drop trailing slash). */
export function normalizeOpenAIBaseURL(baseURL: string): string {
  const next = baseURL.trim() || DEFAULT_OPENAI_BASE_URL;
  return next.replace(/\/+$/, '');
}

export async function saveOpenAIBaseURL(baseURL: string) {
  const next = normalizeOpenAIBaseURL(baseURL);
  await AsyncStorage.setItem(BASE_URL_STORAGE, next);
}

export function maskApiKey(apiKey: string): string {
  const key = apiKey.trim();
  if (key.length < 8) return key ? '••••' : '';
  return `${key.slice(0, 3)}…${key.slice(-4)}`;
}
