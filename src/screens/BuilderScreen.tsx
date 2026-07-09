import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '../theme';

type Msg =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'ai'; text: string; config?: boolean };

const STARTER: Msg[] = [
  {
    id: '1',
    role: 'user',
    text: 'I want to create a skill that generates fan promotional copy.',
  },
  {
    id: '2',
    role: 'ai',
    text: 'I am updating the skill configuration… Please confirm if this looks good to you!',
    config: true,
  },
];

export function BuilderScreen() {
  const [messages, setMessages] = useState<Msg[]>(STARTER);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState('Designer · Ready for your next instruction.');

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    setStatus('Designer · Checking the current draft.');
    const userMsg: Msg = { id: String(Date.now()), role: 'user', text };
    setMessages((prev) => [
      ...prev,
      userMsg,
      {
        id: String(Date.now() + 1),
        role: 'ai',
        text: 'Got it. I’ll wire that into a Keysor skill with text input and in-place preview output.',
        config: true,
      },
    ]);
    setTimeout(() => setStatus('Designer · Ready for your next instruction.'), 900);
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.back}>‹</Text>
        <Text style={styles.title}>Skill Builder</Text>
        <View style={styles.deploy}>
          <Text style={styles.deployText}>Deploy</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.chat} style={styles.chatWrap}>
        {messages.map((msg) =>
          msg.role === 'user' ? (
            <View key={msg.id} style={styles.userWrap}>
              <View style={styles.userBubble}>
                <Text style={styles.userText}>{msg.text}</Text>
              </View>
            </View>
          ) : (
            <View key={msg.id} style={styles.aiWrap}>
              {msg.config ? (
                <View style={styles.config}>
                  <Text style={styles.configTitle}>I/O Setup</Text>
                  <Text style={styles.configLine}>Input: Text Entered</Text>
                  <Text style={styles.configLine}>Output: Show Preview</Text>
                  <Text style={styles.configLine}>Extra Runtime Input: Required</Text>
                </View>
              ) : null}
              <View style={styles.aiRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>✦</Text>
                </View>
                <View style={styles.aiBubble}>
                  <Text style={styles.aiText}>{msg.text}</Text>
                </View>
              </View>
            </View>
          ),
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.status}>{status}</Text>
        <View style={styles.inputBar}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Describe a skill…"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <Pressable style={styles.send} onPress={send}>
            <Text style={styles.sendText}>■</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
    marginBottom: 8,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 34,
    fontSize: 28,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
  },
  deploy: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#E8EAED',
  },
  deployText: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 13,
  },
  chatWrap: {
    flex: 1,
  },
  chat: {
    paddingHorizontal: 18,
    paddingBottom: 20,
    gap: 16,
  },
  userWrap: {
    alignItems: 'flex-start',
  },
  userBubble: {
    maxWidth: '86%',
    backgroundColor: colors.blueBubble,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  userText: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.text,
  },
  aiWrap: {
    gap: 10,
    alignItems: 'flex-end',
  },
  config: {
    width: '86%',
    backgroundColor: colors.blueBubble,
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  configTitle: {
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  configLine: {
    fontSize: 13,
    color: colors.textSoft,
  },
  aiRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    maxWidth: '92%',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 12,
  },
  aiBubble: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  aiText: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.text,
  },
  footer: {
    paddingHorizontal: 18,
    paddingBottom: 100,
    gap: 8,
  },
  status: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingLeft: 16,
    paddingRight: 6,
    minHeight: 52,
    shadowColor: colors.shadowStrong,
    shadowOpacity: 1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 12,
  },
  send: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: {
    color: '#fff',
    fontSize: 10,
  },
});
