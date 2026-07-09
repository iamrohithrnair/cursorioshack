import type { Dispatch, SetStateAction } from 'react';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Keyboard } from '../components/Keyboard';
import { INCIDENT_DEMO, PRINCIPLES_PREVIEW } from '../demoIncident';
import type { AutomationId, KeyBindings } from '../types';
import { colors } from '../theme';

type Props = {
  text: string;
  setText: Dispatch<SetStateAction<string>>;
  shift: boolean;
  setShift: Dispatch<SetStateAction<boolean>>;
  bindings: KeyBindings;
  status: string;
  onRunSkill: (id: AutomationId, key: string) => void;
  onAssignKey: (key: string) => void;
};

export function KeyboardScreen({
  text,
  setText,
  shift,
  setShift,
  bindings,
  status,
  onRunSkill,
  onAssignKey,
}: Props) {
  const onType = useCallback(
    (char: string) => {
      setText((t) => t + char);
      if (shift) setShift(false);
    },
    [setText, setShift, shift],
  );

  const onBackspace = useCallback(() => {
    setText((t) => t.slice(0, -1));
  }, [setText]);

  const onReturn = useCallback(() => {
    setText((t) => t + '\n');
  }, [setText]);

  const onToggleShift = useCallback(() => {
    setShift((s) => !s);
  }, [setShift]);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.brand}>KEYSOR × CURSOR</Text>
        <Text style={styles.headline}>Fix bugs from your phone</Text>
        <Text style={styles.sub}>
          Paste a Slack / CI ping. Hold the Keysor bar. Cursor gets your principles first, then the bug.
        </Text>
      </View>

      <View style={styles.principles}>
        <Text style={styles.principlesLabel}>Prompt enhancement</Text>
        <Text style={styles.principlesText}>{PRINCIPLES_PREVIEW}</Text>
      </View>

      <Pressable
        style={styles.demoChip}
        onPress={() => {
          setText(INCIDENT_DEMO);
          onRunSkill('cursor', ' ');
        }}
      >
        <Text style={styles.demoChipText}>▶ Demo: principles + CI bug → Cursor</Text>
      </Pressable>

      <View style={styles.composer}>
        <Text style={styles.composerLabel}>Paste Slack / CI message</Text>
        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          placeholder={INCIDENT_DEMO}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          showSoftInputOnFocus={false}
        />
        <Text style={styles.status}>{status}</Text>
      </View>

      <Keyboard
        shift={shift}
        bindings={bindings}
        onType={onType}
        onBackspace={onBackspace}
        onReturn={onReturn}
        onToggleShift={onToggleShift}
        onRunSkill={onRunSkill}
        onAssignKey={onAssignKey}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 8,
    justifyContent: 'flex-end',
    paddingBottom: 78,
  },
  header: {
    paddingHorizontal: 22,
    marginBottom: 10,
  },
  brand: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: colors.ink,
  },
  headline: {
    marginTop: 6,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.4,
  },
  sub: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSoft,
  },
  principles: {
    marginHorizontal: 18,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(245,78,0,0.08)',
  },
  principlesLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.7,
    color: '#F54E00',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  principlesText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
    fontWeight: '600',
  },
  demoChip: {
    marginHorizontal: 18,
    marginBottom: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#F54E00',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  demoChipText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  composer: {
    marginHorizontal: 18,
    marginBottom: 10,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: colors.surface,
  },
  composerLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    minHeight: 88,
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
    textAlignVertical: 'top',
  },
  status: {
    marginTop: 6,
    fontSize: 12,
    color: colors.accent,
    fontWeight: '500',
  },
});
