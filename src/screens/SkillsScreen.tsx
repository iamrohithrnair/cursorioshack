import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AUTOMATION_LIST } from '../automations';
import type { AutomationId, CustomSkill, KeyBindings } from '../types';
import { isBuiltinAutomationId } from '../types';
import { colors } from '../theme';

type Props = {
  bindings: KeyBindings;
  customSkills: CustomSkill[];
  onAssign: (key: string) => void;
  onRun: (id: AutomationId, key: string) => void;
};

export function SkillsScreen({ bindings, customSkills, onAssign, onRun }: Props) {
  const [tab, setTab] = useState<'featured' | 'latest'>('featured');
  const bound = Object.entries(bindings).filter(([, id]) => !!id) as [string, AutomationId][];

  const resolveSkill = (id: AutomationId) => {
    if (isBuiltinAutomationId(id)) {
      return AUTOMATION_LIST.find((a) => a.id === id) ?? null;
    }
    const custom = customSkills.find((s) => s.id === id);
    if (!custom) return null;
    return {
      id: custom.id,
      title: custom.title,
      subtitle: custom.subtitle,
      letter: custom.letter,
      tint: custom.tint,
      downloads: 'You',
      creator: 'You',
      creatorSkills: `${custom.integrations.length} integrations`,
    };
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Skills</Text>
        <Text style={styles.search}>⌕</Text>
      </View>

      <View style={styles.segments}>
        {(['featured', 'latest'] as const).map((id) => (
          <Pressable
            key={id}
            onPress={() => setTab(id)}
            style={[styles.segment, tab === id && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, tab === id && styles.segmentTextActive]}>
              {id === 'featured' ? 'Featured' : 'Latest'}
            </Text>
          </Pressable>
        ))}
      </View>

      {customSkills.length > 0 ? (
        <>
          <Text style={styles.section}>YOUR CUSTOM SKILLS</Text>
          <View style={styles.list}>
            {customSkills.map((skill) => (
              <Pressable
                key={skill.id}
                style={styles.card}
                onPress={() => onAssign('r')}
                onLongPress={() => onRun(skill.id, 'custom')}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.badge, { backgroundColor: skill.tint }]}>
                    <Text style={styles.badgeText}>{skill.letter}</Text>
                  </View>
                  <View style={styles.cardCopy}>
                    <Text style={styles.cardTitle}>{skill.title}</Text>
                    <Text style={styles.cardKey}>{skill.subtitle}</Text>
                  </View>
                  <Text style={styles.downloads}>AI</Text>
                </View>
                <View style={styles.cardBottom}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>Y</Text>
                  </View>
                  <Text style={styles.creator}>You · Builder</Text>
                  <Text style={styles.creatorMeta}>
                    {skill.integrations.length
                      ? skill.integrations.map((i) => i.label).join(', ')
                      : 'No integrations'}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      <Text style={styles.section}>SKILL KEYS</Text>
      <View style={styles.list}>
        {bound.map(([key, id], index) => {
          const skill = resolveSkill(id);
          if (!skill) return null;
          return (
            <Pressable
              key={`${key}-${id}`}
              style={[styles.card, index === 1 && styles.cardLift]}
              onPress={() => onAssign(key)}
              onLongPress={() => onRun(id, key)}
            >
              <View style={styles.cardTop}>
                <View style={[styles.badge, { backgroundColor: skill.tint }]}>
                  <Text style={styles.badgeText}>{skill.letter}</Text>
                </View>
                <View style={styles.cardCopy}>
                  <Text style={styles.cardTitle}>{skill.title}</Text>
                  <Text style={styles.cardKey}>Key · {key === ' ' ? 'Keysor bar' : key}</Text>
                </View>
                <Text style={styles.downloads}>↓ {skill.downloads}</Text>
              </View>
              <View style={styles.cardBottom}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{skill.creator.slice(0, 1)}</Text>
                </View>
                <Text style={styles.creator}>{skill.creator}</Text>
                <Text style={styles.creatorMeta}>{skill.creatorSkills}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.add} onPress={() => onAssign('r')}>
        <Text style={styles.addText}>+</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.ink,
  },
  search: {
    fontSize: 22,
    color: colors.textSoft,
  },
  segments: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    marginBottom: 22,
  },
  segment: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#E8EAED',
  },
  segmentActive: {
    backgroundColor: colors.ink,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSoft,
  },
  segmentTextActive: {
    color: '#fff',
  },
  section: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: 12,
    marginTop: 8,
  },
  list: {
    gap: 12,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  cardLift: {
    transform: [{ scale: 1.02 }],
    shadowRadius: 18,
    shadowOpacity: 1,
    shadowColor: colors.shadowStrong,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  cardCopy: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
  },
  cardKey: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textMuted,
  },
  downloads: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSoft,
  },
  cardBottom: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ECEEF2',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E8EAED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSoft,
  },
  creator: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  creatorMeta: {
    fontSize: 12,
    color: colors.textMuted,
    maxWidth: '42%',
  },
  add: {
    marginTop: 18,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  addText: {
    fontSize: 28,
    fontWeight: '500',
    color: colors.ink,
    marginTop: -2,
  },
});
