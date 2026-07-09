import type { Dispatch, SetStateAction } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Keyboard } from '../components/Keyboard';
import type { AutomationId, KeyBindings } from '../types';
import { colors } from '../theme';

type Props = {
  text: string;
  setText: (value: string) => void;
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
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Text style={styles.brand}>KEYSOR</Text>
          <View style={styles.markGrid}>
            {['K', 'E', 'Y', 'S'].map((letter) => (
              <View key={letter} style={styles.markCell}>
                <Text style={styles.markLetter}>{letter}</Text>
              </View>
            ))}
          </View>
        </View>
        <Text style={styles.headline}>Agentic Keyboard{'\n'}commanding Apps & APIs</Text>
      </View>

      <View style={styles.steps}>
        {['Type your intent', 'Hold the Keysor bar', 'Invoke magic'].map((step, i) => (
          <View key={step} style={styles.stepWrap}>
            <View style={styles.stepPill}>
              <Text style={styles.stepText}>{step}</Text>
            </View>
            {i < 2 ? <Text style={styles.arrow}>↓</Text> : null}
          </View>
        ))}
      </View>

      <View style={styles.composer}>
        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          placeholder="plan a watch party for May 21 Knicks game"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          showSoftInputOnFocus={false}
        />
        <Text style={styles.status}>{status}</Text>
      </View>

      <Keyboard
        shift={shift}
        bindings={bindings}
        onType={(char) => {
          setText(text + char);
          if (shift) setShift(false);
        }}
        onBackspace={() => setText(text.slice(0, -1))}
        onReturn={() => setText(text + '\n')}
        onToggleShift={() => setShift((s) => !s)}
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
  },
  header: {
    paddingHorizontal: 22,
    marginBottom: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: colors.ink,
  },
  markGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 36,
    gap: 2,
  },
  markCell: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markLetter: {
    color: '#fff',
    fontSize: 7,
    fontWeight: '700',
  },
  headline: {
    marginTop: 14,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  steps: {
    alignItems: 'center',
    marginBottom: 12,
    gap: 2,
  },
  stepWrap: {
    alignItems: 'center',
  },
  stepPill: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  stepText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  arrow: {
    color: colors.textMuted,
    marginVertical: 2,
  },
  composer: {
    marginHorizontal: 18,
    marginBottom: 12,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  input: {
    minHeight: 72,
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
    textAlignVertical: 'top',
  },
  status: {
    marginTop: 8,
    fontSize: 12,
    color: colors.accent,
    fontWeight: '500',
  },
});
