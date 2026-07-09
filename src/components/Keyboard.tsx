import { BlurView } from 'expo-blur';
import { StyleSheet, Text, View } from 'react-native';
import type { AutomationId, KeyBindings } from '../types';
import { AUTOMATIONS } from '../automations';
import { colors } from '../theme';
import { GlassKey } from './GlassKey';

const ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['⇧', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '⌫'],
  ['123', '🌐', 'space', 'return'],
] as const;

type Props = {
  shift: boolean;
  bindings: KeyBindings;
  onType: (char: string) => void;
  onBackspace: () => void;
  onReturn: () => void;
  onToggleShift: () => void;
  onRunSkill: (id: AutomationId, key: string) => void;
  onAssignKey: (key: string) => void;
};

export function Keyboard({
  shift,
  bindings,
  onType,
  onBackspace,
  onReturn,
  onToggleShift,
  onRunSkill,
  onAssignKey,
}: Props) {
  const renderKey = (raw: string) => {
    if (raw === 'space') {
      const skill = bindings[' '];
      return (
        <GlassKey
          key="space"
          label="space"
          flex={4.2}
          tall
          skillLabel={skill ? AUTOMATIONS[skill].emoji : undefined}
          onTap={() => onType(' ')}
          onLongPress={() => {
            if (skill) onRunSkill(skill, ' ');
            else onAssignKey(' ');
          }}
        />
      );
    }

    if (raw === '⌫') {
      return (
        <GlassKey
          key="backspace"
          label="⌫"
          flex={1.35}
          onTap={onBackspace}
          onLongPress={() => onAssignKey('⌫')}
        />
      );
    }

    if (raw === '⇧') {
      return (
        <GlassKey
          key="shift"
          label={shift ? '⬆' : '⇧'}
          flex={1.35}
          onTap={onToggleShift}
        />
      );
    }

    if (raw === 'return') {
      return (
        <GlassKey
          key="return"
          label="return"
          flex={1.7}
          tall
          onTap={onReturn}
        />
      );
    }

    if (raw === '123' || raw === '🌐') {
      return (
        <GlassKey
          key={raw}
          label={raw}
          flex={1.15}
          tall
          onTap={() => undefined}
        />
      );
    }

    const char = shift ? raw.toUpperCase() : raw;
    const skill = bindings[raw];
    return (
      <GlassKey
        key={raw}
        label={char}
        flex={1}
        skillLabel={skill ? AUTOMATIONS[skill].emoji : undefined}
        onTap={() => onType(char)}
        onLongPress={() => {
          if (skill) onRunSkill(skill, raw);
          else onAssignKey(raw);
        }}
      />
    );
  };

  return (
    <View style={styles.shell}>
      <BlurView intensity={70} tint="systemMaterialLight" style={styles.panel}>
        <View style={styles.hintRow}>
          <Text style={styles.hint}>Hold a key to run its skill · Hold empty key to assign</Text>
        </View>
        {ROWS.map((row, i) => (
          <View key={i} style={[styles.row, i === 1 && styles.rowIndent]}>
            {row.map(renderKey)}
          </View>
        ))}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassEdge,
  },
  panel: {
    paddingTop: 10,
    paddingBottom: 18,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(232,241,245,0.55)',
    gap: 8,
  },
  hintRow: {
    alignItems: 'center',
    marginBottom: 2,
  },
  hint: {
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.2,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 2,
  },
  rowIndent: {
    paddingHorizontal: 18,
  },
});
