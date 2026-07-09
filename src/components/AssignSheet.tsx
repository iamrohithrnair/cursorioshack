import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AUTOMATION_LIST } from '../automations';
import type { AutomationId, CustomSkill } from '../types';
import { colors } from '../theme';

type Props = {
  visible: boolean;
  keyLabel: string | null;
  customSkills: CustomSkill[];
  onClose: () => void;
  onPick: (id: AutomationId) => void;
  onClear: () => void;
};

export function AssignSheet({
  visible,
  keyLabel,
  customSkills,
  onClose,
  onPick,
  onClear,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Assign skill</Text>
          <Text style={styles.sub}>
            Long-press {keyLabel === ' ' ? 'Keysor bar' : keyLabel ?? 'key'} to run this automation
          </Text>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.list}>
            {customSkills.length > 0 ? (
              <>
                <Text style={styles.section}>YOUR SKILLS</Text>
                {customSkills.map((item) => (
                  <Pressable key={item.id} style={styles.row} onPress={() => onPick(item.id)}>
                    <View style={[styles.badge, { backgroundColor: item.tint }]}>
                      <Text style={styles.badgeText}>{item.letter}</Text>
                    </View>
                    <View style={styles.copy}>
                      <Text style={styles.rowTitle}>{item.title}</Text>
                      <Text style={styles.rowSub}>{item.subtitle}</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </Pressable>
                ))}
              </>
            ) : null}
            <Text style={styles.section}>BUILT-IN</Text>
            {AUTOMATION_LIST.map((item) => (
              <Pressable key={item.id} style={styles.row} onPress={() => onPick(item.id)}>
                <View style={[styles.badge, { backgroundColor: item.tint }]}>
                  <Text style={styles.badgeText}>{item.letter}</Text>
                </View>
                <View style={styles.copy}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowSub}>{item.subtitle}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable style={styles.clear} onPress={onClear}>
            <Text style={styles.clearText}>Clear skill</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17,17,17,0.28)',
    justifyContent: 'flex-end',
  },
  sheet: {
    margin: 12,
    maxHeight: '78%',
    borderRadius: 28,
    padding: 20,
    backgroundColor: colors.surface,
    shadowColor: colors.shadowStrong,
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.ink,
  },
  sub: {
    marginTop: 6,
    marginBottom: 16,
    fontSize: 14,
    color: colors.textMuted,
  },
  scroll: {
    maxHeight: 360,
  },
  list: {
    gap: 10,
    paddingBottom: 4,
  },
  section: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
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
  chevron: {
    fontSize: 22,
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
