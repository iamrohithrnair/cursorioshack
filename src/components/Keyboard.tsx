import { BlurView } from 'expo-blur';
import { memo, useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AutomationId, KeyBindings } from '../types';
import { colors } from '../theme';
import { GlassKey } from './GlassKey';

type Mode = 'letters' | 'numbers' | 'symbols' | 'emoji';

const LETTER_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace'],
  ['123', 'emoji', 'space', 'return'],
];

const NUMBER_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'],
  ['#+=', '.', ',', '?', '!', "'", 'backspace'],
  ['ABC', 'emoji', 'space', 'return'],
];

const SYMBOL_ROWS = [
  ['[', ']', '{', '}', '#', '%', '^', '*', '+', '='],
  ['_', '\\', '|', '~', '<', '>', '€', '£', '¥', '•'],
  ['123', '.', ',', '?', '!', "'", 'backspace'],
  ['ABC', 'emoji', 'space', 'return'],
];

const EMOJI_ROWS = [
  ['😀', '😂', '🥰', '😍', '😎', '🤔', '😭', '🔥'],
  ['👍', '👏', '🙏', '💪', '🎉', '✨', '❤️', '💯'],
  ['✅', '⭐', '🚀', '📅', '📍', '💡', '📎', '🔗'],
  ['ABC', '123', 'space', 'return'],
];

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

function KeyboardComponent({
  shift,
  bindings,
  onType,
  onBackspace,
  onReturn,
  onToggleShift,
  onRunSkill,
  onAssignKey,
}: Props) {
  const [mode, setMode] = useState<Mode>('letters');

  const rows = useMemo(() => {
    if (mode === 'numbers') return NUMBER_ROWS;
    if (mode === 'symbols') return SYMBOL_ROWS;
    if (mode === 'emoji') return EMOJI_ROWS;
    return LETTER_ROWS;
  }, [mode]);

  const renderKey = useCallback(
    (raw: string, rowIndex: number) => {
      if (raw === 'space') {
        const skill = bindings[' '];
        return (
          <GlassKey
            key="space"
            label="Keysor"
            flex={mode === 'emoji' ? 3.2 : 4.4}
            variant="keysor"
            onTap={() => onType(' ')}
            onLongPress={() => {
              if (skill) onRunSkill(skill, ' ');
              else onAssignKey(' ');
            }}
          />
        );
      }

      if (raw === 'backspace') {
        return (
          <GlassKey
            key={`backspace-${rowIndex}`}
            label="⌫"
            flex={mode === 'letters' ? 1.35 : 1.5}
            variant="util"
            onTap={onBackspace}
          />
        );
      }

      if (raw === 'shift') {
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

      if (raw === 'return') {
        return (
          <GlassKey
            key="return"
            label="return"
            flex={1.6}
            variant="util"
            onTap={onReturn}
          />
        );
      }

      if (raw === '123') {
        return (
          <GlassKey
            key="to-numbers"
            label="123"
            flex={1.25}
            variant="util"
            onTap={() => setMode('numbers')}
          />
        );
      }

      if (raw === '#+=') {
        return (
          <GlassKey
            key="to-symbols"
            label="#+="
            flex={1.5}
            variant="util"
            onTap={() => setMode('symbols')}
          />
        );
      }

      if (raw === 'ABC') {
        return (
          <GlassKey
            key="to-letters"
            label="ABC"
            flex={1.25}
            variant="util"
            onTap={() => setMode('letters')}
          />
        );
      }

      if (raw === 'emoji') {
        return (
          <GlassKey
            key="to-emoji"
            label="☺"
            flex={1.15}
            variant="util"
            onTap={() => setMode('emoji')}
          />
        );
      }

      if (mode === 'emoji') {
        return (
          <GlassKey
            key={raw}
            label={raw}
            flex={1}
            variant="emoji"
            onTap={() => onType(raw)}
          />
        );
      }

      if (mode === 'letters') {
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
      }

      // numbers / symbols
      return (
        <GlassKey
          key={`${mode}-${raw}`}
          label={raw}
          flex={1}
          onTap={() => onType(raw)}
        />
      );
    },
    [
      bindings,
      mode,
      onAssignKey,
      onBackspace,
      onReturn,
      onRunSkill,
      onToggleShift,
      onType,
      shift,
    ],
  );

  return (
    <View style={styles.shell}>
      {/* One panel blur only — never per-key — keeps glass look without tap lag */}
      <BlurView intensity={40} tint="light" style={styles.blur}>
        <View style={styles.panel}>
          <View style={styles.toolbar}>
            <Text style={styles.toolbarHint}>
              {mode === 'letters'
                ? 'Hold Keysor bar to run'
                : mode === 'emoji'
                  ? 'Emoji'
                  : mode === 'symbols'
                    ? 'Symbols'
                    : 'Numbers'}
            </Text>
            <View style={styles.modeDots}>
              {(['letters', 'numbers', 'symbols', 'emoji'] as Mode[]).map((id) => (
                <View key={id} style={[styles.dot, mode === id && styles.dotActive]} />
              ))}
            </View>
          </View>
          {rows.map((row, i) => (
            <View
              key={`${mode}-${i}`}
              style={[
                styles.row,
                mode === 'letters' && i === 1 && styles.rowIndent,
                mode !== 'letters' && mode !== 'emoji' && i === 2 && styles.rowIndentWide,
              ]}
            >
              {row.map((key) => renderKey(key, i))}
            </View>
          ))}
        </View>
      </BlurView>
    </View>
  );
}

export const Keyboard = memo(KeyboardComponent);

const styles = StyleSheet.create({
  shell: {
    borderRadius: 24,
    overflow: 'hidden',
    marginHorizontal: 10,
    backgroundColor: colors.keyboardTint,
  },
  blur: {
    overflow: 'hidden',
  },
  panel: {
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 5,
    gap: 6,
    backgroundColor: 'rgba(214,232,248,0.28)',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 1,
  },
  toolbarHint: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  modeDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(17,17,17,0.15)',
  },
  dotActive: {
    backgroundColor: colors.accent,
  },
  row: {
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 2,
  },
  rowIndent: {
    paddingHorizontal: 16,
  },
  rowIndentWide: {
    paddingHorizontal: 28,
  },
});
