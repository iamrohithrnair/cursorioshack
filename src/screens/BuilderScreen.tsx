import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  DEFAULT_OPENAI_BASE_URL,
  DEFAULT_OPENAI_MODEL,
  loadOpenAIConfig,
  maskApiKey,
  saveOpenAIApiKey,
  saveOpenAIBaseURL,
  saveOpenAIModel,
} from '../openai/config';
import {
  draftToCustomSkill,
  runSkillBuilderTurn,
  type BuilderChatMessage,
  type BuilderDraft,
} from '../openai/skillBuilder';
import type { CustomSkill } from '../types';
import { colors } from '../theme';

type UiMsg =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'ai'; text: string; draft?: BuilderDraft | null; ready?: boolean };

type Props = {
  customSkills: CustomSkill[];
  onDeploySkill: (skill: CustomSkill) => Promise<void> | void;
};

const STARTER: UiMsg[] = [
  {
    id: '1',
    role: 'ai',
    text: 'Describe a keyboard skill like an intelligent Shortcut — what should happen to the text in the field, and which apps or APIs should it touch (Notion, Gmail, Calendar, Slack…)?',
  },
];

export function BuilderScreen({ customSkills, onDeploySkill }: Props) {
  const [messages, setMessages] = useState<UiMsg[]>(STARTER);
  const [history, setHistory] = useState<BuilderChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState('Designer · Add API key + base URL to start.');
  const [busy, setBusy] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<BuilderDraft | null>(null);
  const [readyToDeploy, setReadyToDeploy] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(DEFAULT_OPENAI_MODEL);
  const [baseURL, setBaseURL] = useState(DEFAULT_OPENAI_BASE_URL);
  const [hasKey, setHasKey] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const chatRef = useRef<ScrollView>(null);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        requestAnimationFrame(() => chatRef.current?.scrollToEnd({ animated: true }));
      },
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const refreshConfig = useCallback(async () => {
    const config = await loadOpenAIConfig();
    setApiKey(config.apiKey);
    setModel(config.model);
    setBaseURL(config.baseURL);
    setHasKey(!!config.apiKey);
    if (config.apiKey) {
      setStatus(`Designer · Ready · ${config.model}`);
    } else {
      setStatus('Designer · Add API key + base URL to start.');
    }
  }, []);

  useEffect(() => {
    void refreshConfig();
  }, [refreshConfig]);

  const masked = useMemo(() => maskApiKey(apiKey), [apiKey]);

  const saveSettings = async () => {
    await saveOpenAIApiKey(apiKey);
    await saveOpenAIModel(model);
    await saveOpenAIBaseURL(baseURL);
    await refreshConfig();
    setShowSettings(false);
    setStatus(
      apiKey.trim()
        ? `Designer · Saved ${maskApiKey(apiKey.trim())} · ${model.trim() || DEFAULT_OPENAI_MODEL}`
        : 'Designer · Key cleared.',
    );
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || busy) return;

    if (!hasKey) {
      setShowSettings(true);
      setStatus('Designer · Paste API key + base URL first.');
      return;
    }

    setDraft('');
    setBusy(true);
    setStatus('Designer · Thinking…');
    const userMsg: UiMsg = { id: String(Date.now()), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);

    const result = await runSkillBuilderTurn({ history, userText: text });
    const aiMsg: UiMsg = {
      id: String(Date.now() + 1),
      role: 'ai',
      text: result.assistantText,
      draft: result.draft,
      ready: result.readyToDeploy,
    };
    setMessages((prev) => [...prev, aiMsg]);
    setHistory((prev) => [
      ...prev,
      { role: 'user', content: text },
      { role: 'assistant', content: result.assistantText },
    ]);
    setPendingDraft(result.draft);
    setReadyToDeploy(result.readyToDeploy);
    setStatus(
      result.error
        ? `Designer · ${result.error}`
        : result.readyToDeploy
          ? 'Designer · Draft ready — tap Deploy.'
          : 'Designer · Ready for your next instruction.',
    );
    setBusy(false);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const deploy = async () => {
    if (!pendingDraft || deploying) return;
    setDeploying(true);
    setStatus('Designer · Deploying skill…');
    try {
      const skill = draftToCustomSkill(pendingDraft, null, customSkills.length);
      await onDeploySkill(skill);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          role: 'ai',
          text: `Deployed “${skill.title}”. Assign it to a key on the Skills tab, then long-press that key on the keyboard to run it with OpenAI.`,
        },
      ]);
      setReadyToDeploy(false);
      setStatus(`Designer · Deployed ${skill.title}.`);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Deploy failed.';
      setStatus(`Designer · ${message}`);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setDeploying(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      <View style={styles.header}>
        <Pressable onPress={() => setShowSettings((v) => !v)} hitSlop={8}>
          <Text style={styles.settingsBtn}>{showSettings ? 'Done' : 'API'}</Text>
        </Pressable>
        <Text style={styles.title}>Skill Builder</Text>
        <Pressable
          style={[styles.deploy, (!readyToDeploy || !pendingDraft) && styles.deployDisabled]}
          disabled={!readyToDeploy || !pendingDraft || deploying}
          onPress={() => void deploy()}
        >
          {deploying ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={[styles.deployText, readyToDeploy && styles.deployTextActive]}>
              Deploy
            </Text>
          )}
        </Pressable>
      </View>

      {showSettings ? (
        <ScrollView
          style={styles.settingsScroll}
          contentContainerStyle={styles.settings}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.settingsTitle}>Model provider (on-device)</Text>
          <Text style={styles.settingsHint}>
            Any OpenAI-compatible API works. Set base URL + key + model (OpenAI, Groq, OpenRouter,
            Together, Fireworks, xAI, local gateways, …). Values stay in AsyncStorage on this phone.
          </Text>
          <Text style={styles.label}>API key {hasKey ? `(${masked})` : ''}</Text>
          <TextInput
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="sk-… or provider token"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            style={styles.field}
          />
          <Text style={styles.label}>Base URL</Text>
          <TextInput
            value={baseURL}
            onChangeText={setBaseURL}
            placeholder={DEFAULT_OPENAI_BASE_URL}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={styles.field}
          />
          <Text style={styles.examples}>
            Examples: https://api.openai.com/v1 · https://api.groq.com/openai/v1 ·
            https://openrouter.ai/api/v1 · https://api.x.ai/v1
          </Text>
          <Text style={styles.label}>Model</Text>
          <TextInput
            value={model}
            onChangeText={setModel}
            placeholder={DEFAULT_OPENAI_MODEL}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.field}
          />
          <Pressable style={styles.saveKey} onPress={() => void saveSettings()}>
            <Text style={styles.saveKeyText}>Save</Text>
          </Pressable>
        </ScrollView>
      ) : null}

      <ScrollView
        ref={chatRef}
        contentContainerStyle={styles.chat}
        style={styles.chatWrap}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        onContentSizeChange={() => chatRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) =>
          msg.role === 'user' ? (
            <View key={msg.id} style={styles.userWrap}>
              <View style={styles.userBubble}>
                <Text style={styles.userText}>{msg.text}</Text>
              </View>
            </View>
          ) : (
            <View key={msg.id} style={styles.aiWrap}>
              {msg.draft ? (
                <View style={styles.config}>
                  <Text style={styles.configTitle}>{msg.draft.title}</Text>
                  <Text style={styles.configLine}>{msg.draft.subtitle}</Text>
                  <Text style={styles.configLine}>
                    Integrations:{' '}
                    {msg.draft.integrations.length
                      ? msg.draft.integrations.map((i) => i.label).join(', ')
                      : 'None'}
                  </Text>
                  {msg.ready ? (
                    <Text style={styles.readyTag}>Ready to deploy</Text>
                  ) : null}
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
        {busy ? (
          <View style={styles.thinking}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.thinkingText}>Designing skill…</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, keyboardVisible && styles.footerKeyboard]}>
        <Text style={styles.status} numberOfLines={2}>
          {status}
        </Text>
        <View style={styles.inputBar}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Describe a skill…"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            onSubmitEditing={() => void send()}
            returnKeyType="send"
            editable={!busy}
            blurOnSubmit={false}
          />
          <Pressable style={styles.send} onPress={() => void send()} disabled={busy}>
            <Text style={styles.sendText}>■</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  settingsBtn: {
    width: 48,
    fontSize: 15,
    fontWeight: '700',
    color: colors.accent,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
  },
  deploy: {
    minWidth: 72,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.ink,
    alignItems: 'center',
  },
  deployDisabled: {
    backgroundColor: '#E8EAED',
  },
  deployText: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 13,
  },
  deployTextActive: {
    color: '#fff',
  },
  settingsScroll: {
    maxHeight: 280,
    marginHorizontal: 18,
    marginBottom: 12,
  },
  settings: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.surface,
    gap: 6,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  settingsHint: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSoft,
    marginTop: 4,
  },
  examples: {
    fontSize: 11,
    lineHeight: 15,
    color: colors.textMuted,
    marginBottom: 2,
  },
  field: {
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  saveKey: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  saveKeyText: {
    color: '#fff',
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
  readyTag: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
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
  thinking: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-end',
  },
  thinkingText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 100,
    gap: 8,
    backgroundColor: colors.bg,
  },
  footerKeyboard: {
    // Soft keyboard covers the floating tab bar — drop that reserved space.
    paddingBottom: 12,
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
