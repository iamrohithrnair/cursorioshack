import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import type { AutomationId, KeyBindings } from '../types';
import { colors } from '../theme';
import { GlassKey } from './GlassKey';

const ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['⇧', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '⌫'],
  ['ABC', '☺', 'space', '⏎'],
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
          label="Keysor"
          flex={4.4}
          variant="keysor"
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
          variant="util"
          onTap={onBackspace}
        />
      );
    }

    if (raw === '⇧') {
      return (
        <GlassKey
          key="shift"
          label={shift ? '⬆' : '⇧'}
          flex={1.35}
          variant="util"
          onTap={onToggleShift}
        />
      );
    }

    if (raw === '⏎') {
      return (
        <GlassKey
          key="return"
          label="⏎"
          flex={1.35}
          variant="util"
          onTap={onReturn}
        />
      );
    }

    if (raw === 'ABC' || raw === '☺') {
      return (
        <GlassKey
          key={raw}
          label={raw}
          flex={1.15}
          variant="util"
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
        skillBound={!!skill}
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
      <BlurView intensity={55} tint="systemUltraThinMaterialLight" style={styles.blur}>
        <LinearGradient
          colors={['rgba(214,232,248,0.75)', 'rgba(245,248,252,0.9)', 'rgba(232,240,250,0.85)']}
          style={styles.panel}
        >
          <View style={styles.toolbar}>
            <Text style={styles.mic}>🎙</Text>
            <Text style={styles.toolbarHint}>Hold Keysor bar to run</Text>
            <View style={styles.logoMark}>
              <Text style={styles.logoLetter}>K</Text>
            </View>
          </View>
          {ROWS.map((row, i) => (
            <View key={i} style={[styles.row, i === 1 && styles.rowIndent]}>
              {row.map(renderKey)}
            </View>
          ))}
        </LinearGradient>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: 28,
    overflow: 'hidden',
    marginHorizontal: 10,
    shadowColor: colors.shadowStrong,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  blur: {
    overflow: 'hidden',
  },
  panel: {
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 6,
    gap: 7,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 2,
  },
  mic: {
    fontSize: 14,
  },
  toolbarHint: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  logoMark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
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
