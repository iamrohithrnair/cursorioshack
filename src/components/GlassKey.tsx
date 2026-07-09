import { BlurView } from 'expo-blur';
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
  width?: number | `${number}%`;
  flex?: number;
  skillLabel?: string;
  onTap: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  tall?: boolean;
};

export function GlassKey({
  label,
  width,
  flex,
  skillLabel,
  onTap,
  onLongPress,
  style,
  tall,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

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

  return (
    <Animated.View
      style={[
        styles.wrap,
        width != null ? { width } : null,
        flex != null ? { flex } : null,
        { transform: [{ scale }] },
        style,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={skillLabel ? `${label}, skill ${skillLabel}` : label}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={() => {
          void Haptics.selectionAsync();
          onTap();
        }}
        onLongPress={() => {
          if (!onLongPress) return;
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onLongPress();
        }}
        delayLongPress={380}
        style={styles.press}
      >
        <BlurView intensity={48} tint="systemThinMaterialLight" style={[styles.key, tall && styles.tall]}>
          <View style={styles.sheen} />
          <Text style={styles.label}>{label}</Text>
          {skillLabel ? <Text style={styles.skill}>{skillLabel}</Text> : null}
        </BlurView>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 46,
  },
  press: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: colors.keyShadow,
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  key: {
    flex: 1,
    minHeight: 46,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassEdge,
    backgroundColor: colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tall: {
    minHeight: 52,
  },
  sheen: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.18)',
    height: '45%',
  },
  label: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  skill: {
    position: 'absolute',
    top: 4,
    right: 6,
    fontSize: 9,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 0.3,
  },
});
