import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AssignSheet } from './src/components/AssignSheet';
import { Keyboard } from './src/components/Keyboard';
import { AUTOMATIONS, runAutomation } from './src/automations';
import { loadBindings, saveBindings } from './src/storage';
import { colors } from './src/theme';
import type { AutomationId, KeyBindings } from './src/types';

export default function App() {
  const [text, setText] = useState('');
  const [shift, setShift] = useState(false);
  const [bindings, setBindings] = useState<KeyBindings | null>(null);
  const [assignKey, setAssignKey] = useState<string | null>(null);
  const [status, setStatus] = useState('Type an intent, then hold space or a skill key.');
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
    setStatus(`Ran ${AUTOMATIONS[id].title} from ${key === ' ' ? 'space' : key}`);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (!bindings) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.mist} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#7EB8C9', '#D7E8DE', '#F3E7D3']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />

        <View style={styles.header}>
          <Text style={styles.brand}>Keysor</Text>
          <Text style={styles.tagline}>An agentic keyboard</Text>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.lead}>
            Type what you want. Hold a key to run its automation in place — no app switching.
          </Text>

          <View style={styles.composer}>
            <Text style={styles.composerLabel}>Message field</Text>
            <TextInput
              value={text}
              onChangeText={setText}
              multiline
              placeholder="plan a watch party for May 21 Knicks game"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              showSoftInputOnFocus={false}
              caretHidden={false}
            />
            <Text style={styles.status}>{status}</Text>
          </View>

          <View style={styles.skills}>
            <Text style={styles.sectionTitle}>Bound skills</Text>
            {Object.entries(bindings).map(([key, id]) =>
              id ? (
                <Pressable
                  key={key}
                  style={styles.skillChip}
                  onPress={() => setAssignKey(key)}
                  onLongPress={() => runSkill(id, key)}
                >
                  <Text style={styles.skillKey}>{key === ' ' ? 'space' : key}</Text>
                  <Text style={styles.skillName}>
                    {AUTOMATIONS[id].emoji} {AUTOMATIONS[id].title}
                  </Text>
                </Pressable>
              ) : null,
            )}
          </View>

          <View style={styles.access}>
            <Text style={styles.sectionTitle}>Early access</Text>
            <Text style={styles.accessCopy}>
              72-hour launch window — lifetime access, no signup or payment.
            </Text>
            <Pressable
              style={[styles.cta, claimed && styles.ctaDone]}
              onPress={() => {
                setClaimed(true);
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              }}
            >
              <Text style={styles.ctaText}>
                {claimed ? "You're on the list — check replies for activate steps" : 'Claim lifetime access'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        <Keyboard
          shift={shift}
          bindings={bindings}
          onType={(char) => {
            setText((t) => t + char);
            if (shift) setShift(false);
          }}
          onBackspace={() => setText((t) => t.slice(0, -1))}
          onReturn={() => setText((t) => t + '\n')}
          onToggleShift={() => setShift((s) => !s)}
          onRunSkill={runSkill}
          onAssignKey={setAssignKey}
        />
      </SafeAreaView>

      <AssignSheet
        visible={assignKey != null}
        keyLabel={assignKey}
        onClose={() => setAssignKey(null)}
        onPick={(id) => {
          if (!assignKey) return;
          void updateBindings({ ...bindings, [assignKey]: id });
          setStatus(`Assigned ${AUTOMATIONS[id].title} to ${assignKey === ' ' ? 'space' : assignKey}`);
          setAssignKey(null);
        }}
        onClear={() => {
          if (!assignKey) return;
          const next = { ...bindings };
          delete next[assignKey];
          void updateBindings(next);
          setStatus(`Cleared skill on ${assignKey === ' ' ? 'space' : assignKey}`);
          setAssignKey(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink,
  },
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 4,
  },
  brand: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -1,
  },
  tagline: {
    marginTop: 2,
    fontSize: 15,
    color: colors.inkSoft,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 22,
    paddingBottom: 16,
    gap: 18,
  },
  lead: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
    maxWidth: 340,
  },
  composer: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.48)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassEdge,
  },
  composerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 8,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  input: {
    minHeight: 120,
    fontSize: 17,
    lineHeight: 24,
    color: colors.text,
    textAlignVertical: 'top',
  },
  status: {
    marginTop: 10,
    fontSize: 13,
    color: colors.accent,
  },
  skills: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkSoft,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: colors.accentSoft,
  },
  skillKey: {
    minWidth: 52,
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
    textTransform: 'uppercase',
  },
  skillName: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  access: {
    gap: 8,
    marginBottom: 4,
  },
  accessCopy: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.text,
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: colors.ink,
  },
  ctaDone: {
    backgroundColor: colors.accent,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
