import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CustomSkill, SkillId } from './types';
import { isBuiltinAutomationId } from './types';

const CUSTOM_SKILLS_KEY = 'keysor.customSkills.v1';

const TINTS = ['#4B8CFF', '#7C6CFF', '#2BB673', '#FF8A3D', '#E4578C', '#111111', '#0F9E9B'];

export function createCustomSkillId(): SkillId {
  return `custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function letterFromTitle(title: string): string {
  const ch = title.trim().charAt(0).toUpperCase();
  return /[A-Z0-9]/.test(ch) ? ch : 'S';
}

export function tintForIndex(index: number): string {
  return TINTS[index % TINTS.length];
}

export async function loadCustomSkills(): Promise<CustomSkill[]> {
  try {
    const raw = await AsyncStorage.getItem(CUSTOM_SKILLS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CustomSkill[];
    return Array.isArray(parsed) ? parsed.filter((s) => s && typeof s.id === 'string') : [];
  } catch {
    return [];
  }
}

export async function saveCustomSkills(skills: CustomSkill[]) {
  await AsyncStorage.setItem(CUSTOM_SKILLS_KEY, JSON.stringify(skills));
}

export async function upsertCustomSkill(skill: CustomSkill): Promise<CustomSkill[]> {
  const current = await loadCustomSkills();
  const index = current.findIndex((s) => s.id === skill.id);
  const next =
    index >= 0
      ? current.map((s, i) => (i === index ? skill : s))
      : [skill, ...current];
  await saveCustomSkills(next);
  return next;
}

export async function deleteCustomSkill(id: SkillId): Promise<CustomSkill[]> {
  const next = (await loadCustomSkills()).filter((s) => s.id !== id);
  await saveCustomSkills(next);
  return next;
}

export function findCustomSkill(skills: CustomSkill[], id: SkillId): CustomSkill | undefined {
  if (isBuiltinAutomationId(id)) return undefined;
  return skills.find((s) => s.id === id);
}
