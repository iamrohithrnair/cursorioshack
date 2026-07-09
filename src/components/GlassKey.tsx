import { memo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors } from '../theme';

type Props = {
  label: string;
  flex?: number;
  skillBound?: boolean;
  variant?: 'default' | 'keysor' | 'util' | 'emoji';
  onTap: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

function GlassKeyComponent({
  label,
  flex,
  skillBound,
  variant = 'default',
  onTap,
  onLongPress,
  style,
}: Props) {
  const isKeysor = variant === 'keysor';
  const isEmoji = variant === 'emoji';

  return (
    <View style={[styles.wrap, flex != null ? { flex } : null, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isKeysor ? 'Keysor bar' : label}
        onPress={onTap}
        onLongPress={onLongPress}
        delayLongPress={380}
        style={({ pressed }) => [
          styles.key,
          variant === 'util' && styles.utilKey,
          skillBound && styles.skillKey,
          isKeysor && styles.keysorKey,
          isEmoji && styles.emojiKey,
          pressed && styles.pressed,
        ]}
      >
        {isKeysor ? (
          <>
            <Text style={styles.spark}>✦</Text>
            <Text style={styles.keysorLabel}>Keysor</Text>
          </>
        ) : (
          <Text
            style={[
              styles.label,
              variant === 'util' && styles.utilLabel,
              isEmoji && styles.emojiLabel,
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

export const GlassKey = memo(GlassKeyComponent);

const styles = StyleSheet.create({
  wrap: {
    minHeight: 42,
  },
  key: {
    flex: 1,
    minHeight: 42,
    borderRadius: 8,
    backgroundColor: colors.keyFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
  skillKey: {
    backgroundColor: 'rgba(232,242,255,0.95)',
  },
  utilKey: {
    backgroundColor: 'rgba(220,226,234,0.95)',
  },
  keysorKey: {
    minHeight: 44,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#EAF3FF',
  },
  emojiKey: {
    backgroundColor: 'transparent',
    minHeight: 40,
  },
  spark: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  keysorLabel: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: '600',
  },
  label: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '500',
  },
  utilLabel: {
    fontSize: 14,
    color: colors.textSoft,
    fontWeight: '600',
  },
  emojiLabel: {
    fontSize: 26,
  },
});
