import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_BINDINGS } from './automations';
import type { KeyBindings } from './types';

const BINDINGS_KEY = 'keysor.bindings.v1';
const SETUP_KEY = 'keysor.setup.done.v1';

export async function loadBindings(): Promise<KeyBindings> {
  try {
    const raw = await AsyncStorage.getItem(BINDINGS_KEY);
    if (!raw) return { ...DEFAULT_BINDINGS };
    return { ...DEFAULT_BINDINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_BINDINGS };
  }
}

export async function saveBindings(bindings: KeyBindings) {
  await AsyncStorage.setItem(BINDINGS_KEY, JSON.stringify(bindings));
}

export async function loadSetupDone(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(SETUP_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function saveSetupDone() {
  await AsyncStorage.setItem(SETUP_KEY, '1');
}
