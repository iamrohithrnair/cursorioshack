import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRef } from 'react';
import {
  Animated,
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
  variant?: 'default' | 'keysor' | 'util';
  onTap: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function GlassKey({
  label,
  flex,
  skillBound,
  variant = 'default',
  onTap,
  onLongPress,
  style,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const triggerLong = () => {
    if (!onLongPress) return;
    Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start();
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress();
  };

  const isKeysor = variant === 'keysor';

  return (
    <Animated.View
      style={[
        styles.wrap,
        flex != null ? { flex } : null,
        { transform: [{ scale }] },
        style,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isKeysor ? 'Keysor bar' : label}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={() => {
          void Haptics.selectionAsync();
          onTap();
        }}
        onLongPress={triggerLong}
        delayLongPress={380}
        style={styles.press}
      >
        {isKeysor ? (
          <LinearGradient
            colors={['#EAF3FF', '#F7FBFF', '#E8F0FF', '#F4ECFF']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.key, styles.keysorKey]}
          >
            <Animated.View style={[styles.ripple, { opacity: glow }]} />
            <Text style={styles.spark}>✦</Text>
            <Text style={styles.keysorLabel}>Keysor</Text>
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.key,
              variant === 'util' && styles.utilKey,
              skillBound && styles.skillKey,
            ]}
          >
            <Text style={[styles.label, variant === 'util' && styles.utilLabel]}>{label}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 44,
  },
  press: {
    flex: 1,
    borderRadius: 10,
  },
  key: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: colors.keyFill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassEdge,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  skillKey: {
    backgroundColor: 'rgba(232,242,255,0.95)',
    borderColor: 'rgba(120,180,255,0.45)',
    shadowColor: colors.keyGlow,
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  utilKey: {
    backgroundColor: 'rgba(236,240,245,0.95)',
  },
  keysorKey: {
    minHeight: 48,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    overflow: 'hidden',
    borderColor: 'rgba(180,210,255,0.7)',
  },
  ripple: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(120,180,255,0.28)',
  },
  spark: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  keysorLabel: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  label: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '500',
  },
  utilLabel: {
    fontSize: 15,
    color: colors.textSoft,
  },
});
