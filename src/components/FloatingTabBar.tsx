import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { TabId } from '../types';
import { colors } from '../theme';

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'keyboard', icon: '⌨', label: 'Keyboard' },
  { id: 'skills', icon: '✦', label: 'Skills' },
  { id: 'builder', icon: '✧', label: 'Builder' },
  { id: 'access', icon: '+', label: 'Access' },
];

type Props = {
  active: TabId;
  onChange: (tab: TabId) => void;
};

export function FloatingTabBar({ active, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      <BlurView intensity={70} tint="systemChromeMaterialLight" style={styles.bar}>
        {TABS.map((tab) => {
          const selected = tab.id === active;
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              onPress={() => onChange(tab.id)}
              style={[styles.item, selected && styles.itemActive]}
            >
              <Text style={[styles.icon, selected && styles.iconActive]}>{tab.icon}</Text>
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 18,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: colors.shadowStrong,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  item: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemActive: {
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  icon: {
    fontSize: 18,
    color: colors.textMuted,
  },
  iconActive: {
    color: colors.ink,
  },
});
