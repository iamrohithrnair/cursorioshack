import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { AssignSheet } from './src/components/AssignSheet';
import { FloatingTabBar } from './src/components/FloatingTabBar';
import { PromptPreview } from './src/components/PromptPreview';
import { AUTOMATIONS, runAutomation } from './src/automations';
import { buildCursorPrompt, sendToCursorApp } from './src/cursorHandoff';
import { INCIDENT_DEMO } from './src/demoIncident';
import { AccessScreen } from './src/screens/AccessScreen';
import { BuilderScreen } from './src/screens/BuilderScreen';
import { KeyboardScreen } from './src/screens/KeyboardScreen';
import { SetupScreen } from './src/screens/SetupScreen';
import { SkillsScreen } from './src/screens/SkillsScreen';
import {
  loadBindings,
  saveBindings,
  saveSetupDone,
} from './src/storage';
import { colors } from './src/theme';
import type { AutomationId, KeyBindings, TabId } from './src/types';

export default function App() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<TabId>('keyboard');
  const [text, setText] = useState(INCIDENT_DEMO);
  const [shift, setShift] = useState(false);
  const [bindings, setBindings] = useState<KeyBindings | null>(null);
  const [assignKey, setAssignKey] = useState<string | null>(null);
  const [status, setStatus] = useState('Step 2: hold the Keysor space bar.');
  const [claimed, setClaimed] = useState(false);
  const [sending, setSending] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPrompt, setPreviewPrompt] = useState('');
  const [cursorOpened, setCursorOpened] = useState(false);
  const [lastIntent, setLastIntent] = useState(INCIDENT_DEMO);

  useEffect(() => {
    void (async () => {
      const nextBindings = await loadBindings();
      // Space is always Cursor in the keyboard UI; keep binding in sync for Skills list.
      const forced = { ...nextBindings, ' ': 'cursor' as const };
      setBindings(forced);
      setTab('keyboard');
      setReady(true);
    })();
  }, []);

  const updateBindings = async (next: KeyBindings) => {
    const forced = { ...next, ' ': 'cursor' as const };
    setBindings(forced);
    await saveBindings(forced);
  };

  const loadDemo = useCallback(() => {
    setText(INCIDENT_DEMO);
    setStatus('Demo loaded. Hold the Keysor space bar.');
    setTab('keyboard');
  }, []);

  const handoffToCursor = useCallback(async (intent: string) => {
    const payload = intent.trim() || INCIDENT_DEMO;
    setSending(true);
    setTab('keyboard');
    setLastIntent(payload);
    const prompt = buildCursorPrompt(payload);
    setPreviewPrompt(prompt);

    const { opened } = await sendToCursorApp(payload);
    setCursorOpened(opened);
    setPreviewOpen(true);
    setText(runAutomation('cursor', payload));
    setStatus(
      opened
        ? 'Cursor opened — confirm the agent. Principles are already in the prompt.'
        : 'Deep link blocked — use Open in Cursor below (prompt is ready).',
    );
    setSending(false);
    void Haptics.notificationAsync(
      opened
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning,
    );
  }, []);

  const runSkill = useCallback(
    (id: AutomationId, key: string) => {
      if (id === 'cursor' || key === ' ') {
        // Prefer live field text; if already showing handoff receipt, resend last incident.
        const live = text.trim();
        const intent = live.includes('Handed to Cursor') ? lastIntent : live || INCIDENT_DEMO;
        void handoffToCursor(intent);
        return;
      }

      setText((current) => runAutomation(id, current));
      setStatus(`Ran ${AUTOMATIONS[id].title} from ${key}`);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    [handoffToCursor, lastIntent, text],
  );

  if (!ready || !bindings) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />

        {tab === 'setup' ? (
          <SetupScreen
            onContinue={() => {
              void saveSetupDone();
              loadDemo();
            }}
            onOpenDemoKeyboard={loadDemo}
          />
        ) : null}

        {tab === 'keyboard' ? (
          <KeyboardScreen
            text={text}
            setText={setText}
            shift={shift}
            setShift={setShift}
            bindings={bindings}
            status={status}
            sending={sending}
            onRunSkill={runSkill}
            onAssignKey={setAssignKey}
            onLoadDemo={loadDemo}
          />
        ) : null}

        {tab === 'skills' ? (
          <SkillsScreen
            bindings={bindings}
            onAssign={setAssignKey}
            onRun={runSkill}
          />
        ) : null}

        {tab === 'builder' ? <BuilderScreen /> : null}
        {tab === 'access' ? (
          <AccessScreen claimed={claimed} onClaim={() => setClaimed(true)} />
        ) : null}
      </SafeAreaView>

      <FloatingTabBar active={tab} onChange={setTab} />

      <PromptPreview
        visible={previewOpen}
        prompt={previewPrompt}
        opened={cursorOpened}
        onClose={() => setPreviewOpen(false)}
        onOpenCursor={() => {
          void sendToCursorApp(lastIntent);
        }}
      />

      <AssignSheet
        visible={assignKey != null}
        keyLabel={assignKey}
        onClose={() => setAssignKey(null)}
        onPick={(id) => {
          if (!assignKey) return;
          // Never rebind space away from Cursor during the demo.
          if (assignKey === ' ') {
            setAssignKey(null);
            setStatus('Space bar is locked to Fix from phone for this demo.');
            return;
          }
          void updateBindings({ ...bindings, [assignKey]: id });
          setStatus(`Assigned ${AUTOMATIONS[id].title} to ${assignKey}`);
          setAssignKey(null);
        }}
        onClear={() => {
          if (!assignKey) return;
          if (assignKey === ' ') {
            setAssignKey(null);
            setStatus('Space bar stays on Fix from phone for this demo.');
            return;
          }
          const next = { ...bindings };
          delete next[assignKey];
          void updateBindings(next);
          setStatus(`Cleared skill on ${assignKey}`);
          setAssignKey(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  safe: {
    flex: 1,
  },
});
