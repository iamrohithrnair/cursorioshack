import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { AssignSheet } from './src/components/AssignSheet';
import { FloatingTabBar } from './src/components/FloatingTabBar';
import { AUTOMATIONS, runAutomation } from './src/automations';
import { AccessScreen } from './src/screens/AccessScreen';
import { BuilderScreen } from './src/screens/BuilderScreen';
import { KeyboardScreen } from './src/screens/KeyboardScreen';
import { SkillsScreen } from './src/screens/SkillsScreen';
import { loadBindings, saveBindings } from './src/storage';
import { colors } from './src/theme';
import type { AutomationId, KeyBindings, TabId } from './src/types';

export default function App() {
  const [tab, setTab] = useState<TabId>('keyboard');
  const [text, setText] = useState('');
  const [shift, setShift] = useState(false);
  const [bindings, setBindings] = useState<KeyBindings | null>(null);
  const [assignKey, setAssignKey] = useState<string | null>(null);
  const [status, setStatus] = useState('Type an intent, then hold the Keysor bar.');
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    void loadBindings().then(setBindings);
  }, []);

  const updateBindings = async (next: KeyBindings) => {
    setBindings(next);
    await saveBindings(next);
  };

  const runSkill = (id: AutomationId, key: string) => {
    const result = runAutomation(id, text);
    setText(result);
    setStatus(`Ran ${AUTOMATIONS[id].title} from ${key === ' ' ? 'Keysor bar' : key}`);
    setTab('keyboard');
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (!bindings) {
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

        {tab === 'keyboard' ? (
          <KeyboardScreen
            text={text}
            setText={setText}
            shift={shift}
            setShift={setShift}
            bindings={bindings}
            status={status}
            onRunSkill={runSkill}
            onAssignKey={setAssignKey}
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

      <AssignSheet
        visible={assignKey != null}
        keyLabel={assignKey}
        onClose={() => setAssignKey(null)}
        onPick={(id) => {
          if (!assignKey) return;
          void updateBindings({ ...bindings, [assignKey]: id });
          setStatus(`Assigned ${AUTOMATIONS[id].title} to ${assignKey === ' ' ? 'Keysor bar' : assignKey}`);
          setAssignKey(null);
        }}
        onClear={() => {
          if (!assignKey) return;
          const next = { ...bindings };
          delete next[assignKey];
          void updateBindings(next);
          setStatus(`Cleared skill on ${assignKey === ' ' ? 'Keysor bar' : assignKey}`);
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
