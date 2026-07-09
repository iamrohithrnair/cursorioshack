import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_BINDINGS } from './automations';
import type { KeyBindings } from './types';

const KEY = 'keysor.bindings.v1';

export async function loadBindings(): Promise<KeyBindings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_BINDINGS };
    return { ...DEFAULT_BINDINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_BINDINGS };
  }
}

export async function saveBindings(bindings: KeyBindings) {
  await AsyncStorage.setItem(KEY, JSON.stringify(bindings));
}
