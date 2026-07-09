import type { Dispatch, SetStateAction } from 'react';
import { useCallback } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Keyboard } from '../components/Keyboard';
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
        <Text style={styles.brand}>KEYSOR</Text>
        <Text style={styles.headline}>Type · Hold · Act</Text>
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
  composer: {
    marginHorizontal: 18,
    marginBottom: 10,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: colors.surface,
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
