import { BlurView } from 'expo-blur';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { AUTOMATION_LIST } from '../automations';
import type { AutomationId } from '../types';
import { colors } from '../theme';

type Props = {
  visible: boolean;
  keyLabel: string | null;
  onClose: () => void;
  onPick: (id: AutomationId) => void;
  onClear: () => void;
};

export function AssignSheet({ visible, keyLabel, onClose, onPick, onClear }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheetWrap} onPress={(e) => e.stopPropagation()}>
          <BlurView intensity={80} tint="systemThickMaterialLight" style={styles.sheet}>
            <Text style={styles.title}>Assign skill</Text>
            <Text style={styles.sub}>
              Long-press {keyLabel === ' ' ? 'space' : keyLabel ?? 'key'} to run this automation
            </Text>
            <View style={styles.list}>
              {AUTOMATION_LIST.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.row}
                  onPress={() => onPick(item.id)}
                >
                  <Text style={styles.emoji}>{item.emoji}</Text>
                  <View style={styles.copy}>
                    <Text style={styles.rowTitle}>{item.title}</Text>
                    <Text style={styles.rowSub}>{item.subtitle}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.clear} onPress={onClear}>
              <Text style={styles.clearText}>Clear skill</Text>
            </Pressable>
          </BlurView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,28,44,0.35)',
    justifyContent: 'flex-end',
  },
  sheetWrap: {
    padding: 12,
  },
  sheet: {
    borderRadius: 24,
    overflow: 'hidden',
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassEdge,
    backgroundColor: colors.glassStrong,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  sub: {
    marginTop: 6,
    marginBottom: 14,
    fontSize: 14,
    color: colors.textMuted,
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  emoji: {
    fontSize: 20,
    color: colors.accent,
    width: 28,
    textAlign: 'center',
  },
  copy: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  rowSub: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textMuted,
  },
  clear: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 12,
  },
  clearText: {
    color: colors.danger,
    fontWeight: '600',
  },
});
