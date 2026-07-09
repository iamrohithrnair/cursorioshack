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
  sending: boolean;
  onRunSkill: (id: AutomationId, key: string) => void;
  onAssignKey: (key: string) => void;
  onLoadDemo: () => void;
};

export function KeyboardScreen({
  text,
  setText,
  shift,
  setShift,
  bindings,
  status,
  sending,
  onRunSkill,
  onAssignKey,
  onLoadDemo,
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
        <Text style={styles.brand}>DEMO · FIX FROM PHONE</Text>
        <Text style={styles.headline}>Hold space → Cursor</Text>
      </View>

      <View style={styles.steps}>
        <View style={styles.step}>
          <Text style={styles.stepNum}>1</Text>
          <Text style={styles.stepText}>Incident loaded below</Text>
        </View>
        <View style={styles.step}>
          <Text style={styles.stepNum}>2</Text>
          <Text style={styles.stepText}>Hold the orange space bar</Text>
        </View>
        <View style={styles.step}>
          <Text style={styles.stepNum}>3</Text>
          <Text style={styles.stepText}>Cursor opens with principles + bug</Text>
        </View>
      </View>

      <View style={styles.principles}>
        <Text style={styles.principlesLabel}>Always prepended to the prompt</Text>
        <Text style={styles.principlesText}>{PRINCIPLES_PREVIEW}</Text>
      </View>

      <View style={styles.composer}>
        <View style={styles.composerTop}>
          <Text style={styles.composerLabel}>Slack / CI message</Text>
          <Pressable onPress={onLoadDemo}>
            <Text style={styles.reload}>Reload demo</Text>
          </Pressable>
        </View>
        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          placeholder={INCIDENT_DEMO}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          showSoftInputOnFocus={false}
        />
        <Text style={styles.status}>{sending ? 'Opening Cursor…' : status}</Text>
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
    paddingTop: 6,
    justifyContent: 'flex-end',
    paddingBottom: 78,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  brand: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#F54E00',
  },
  headline: {
    marginTop: 4,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  steps: {
    marginHorizontal: 18,
    marginBottom: 8,
    gap: 6,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 22,
    backgroundColor: colors.ink,
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
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
  composer: {
    marginHorizontal: 18,
    marginBottom: 10,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: colors.surface,
  },
  composerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  composerLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  reload: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F54E00',
  },
  input: {
    minHeight: 96,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    textAlignVertical: 'top',
  },
  status: {
    marginTop: 6,
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600',
  },
});
