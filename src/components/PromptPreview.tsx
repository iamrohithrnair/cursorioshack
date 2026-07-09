import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

type Props = {
  visible: boolean;
  prompt: string;
  opened: boolean;
  copied: boolean;
  onClose: () => void;
  onOpenCursor: () => void;
};

export function PromptPreview({
  visible,
  prompt,
  opened,
  copied,
  onClose,
  onOpenCursor,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.kicker}>
            {copied ? 'Prompt copied' : 'Enhanced prompt'}
          </Text>
          <Text style={styles.title}>
            {opened ? 'Finish in Cursor' : 'Open Cursor to continue'}
          </Text>
          <Text style={styles.sub}>
            {opened
              ? copied
                ? 'Cursor app should open with this prompt. If the field is empty, long-press → Paste.'
                : 'Confirm the agent prompt in the Cursor app.'
              : copied
                ? 'Prompt is on your clipboard. Open the Cursor app and paste into a new agent chat.'
                : 'Open the Cursor app and paste this prompt into a new agent chat.'}
          </Text>

          <ScrollView style={styles.promptBox} contentContainerStyle={styles.promptContent}>
            <Text style={styles.promptText}>{prompt}</Text>
          </ScrollView>

          <Pressable style={styles.primary} onPress={onOpenCursor}>
            <Text style={styles.primaryText}>Open Cursor</Text>
          </Pressable>
          <Pressable style={styles.secondary} onPress={onClose}>
            <Text style={styles.secondaryText}>Back to Keysor</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17,17,17,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '88%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.accent,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '800',
    color: colors.ink,
  },
  sub: {
    marginTop: 6,
    marginBottom: 14,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSoft,
  },
  promptBox: {
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    maxHeight: 320,
  },
  promptContent: {
    padding: 14,
  },
  promptText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.text,
    fontFamily: 'Menlo',
  },
  primary: {
    marginTop: 16,
    backgroundColor: colors.ink,
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondary: {
    marginTop: 10,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  secondaryText: {
    color: colors.ink,
    fontWeight: '600',
  },
});
