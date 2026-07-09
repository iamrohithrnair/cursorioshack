import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../theme';

type Props = {
  onContinue: () => void;
  onOpenDemoKeyboard: () => void;
};

const STEPS = [
  {
    id: 1,
    title: 'Open Keyboard settings',
    body: 'iOS Settings → General → Keyboard → Keyboards',
  },
  {
    id: 2,
    title: 'Add New Keyboard…',
    body: 'Tap Add New Keyboard…, then choose Keysor under Third-Party Keyboards.',
  },
  {
    id: 3,
    title: 'Allow Full Access',
    body: 'Tap Keysor → turn on Allow Full Access → Allow. This lets skills run and return results in any app.',
  },
  {
    id: 4,
    title: 'Switch to Keysor while typing',
    body: 'In any text field, hold 🌐 / globe and select Keysor. Hold the Keysor bar to run an automation.',
  },
] as const;

export function SetupScreen({ onContinue, onOpenDemoKeyboard }: Props) {
  const [step, setStep] = useState(0);
  const [allowed, setAllowed] = useState(false);
  const pulse = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.35, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const openSettings = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep(1);

    // Best-effort deep links; iOS may ignore private prefs URLs and fall back.
    const candidates = [
      'App-Prefs:General&path=Keyboard',
      'prefs:root=General&path=Keyboard',
    ];

    for (const url of candidates) {
      try {
        await Linking.openURL(url);
        return;
      } catch {
        // try next
      }
    }

    await Linking.openSettings();
  };

  const requestFullAccessAck = () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAllowed(true);
    setStep(3);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>SYSTEM KEYBOARD</Text>
      <Text style={styles.title}>Enable Keysor on iOS</Text>
      <Text style={styles.lead}>
        Keysor installs as a real iOS keyboard. iOS will ask you to enable it and Allow Full Access
        before skills can run in Messages, Mail, and other apps.
      </Text>

      <View style={styles.phone}>
        <View style={styles.statusBar}>
          <Text style={styles.statusText}>Settings</Text>
        </View>
        <Text style={styles.settingsTitle}>Keyboards</Text>

        <View style={[styles.settingsRow, step >= 1 && styles.settingsRowActive]}>
          <Text style={styles.settingsLabel}>Keyboards</Text>
          <Text style={styles.settingsValue}>{step >= 2 ? '3 Keyboards' : '2 Keyboards'} ›</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>THIRD-PARTY KEYBOARDS</Text>
          <View style={styles.keyboardRow}>
            <View>
              <Text style={styles.keyboardName}>Keysor</Text>
              <Text style={styles.keyboardSub}>
                {allowed ? 'Full Access Allowed' : 'Full Access Required'}
              </Text>
            </View>
            <Animated.View
              style={[styles.toggle, allowed && styles.toggleOn, { opacity: allowed ? 1 : pulse }]}
            >
              <View style={[styles.toggleKnob, allowed && styles.toggleKnobOn]} />
            </Animated.View>
          </View>
          {!allowed ? (
            <Pressable style={styles.allowBtn} onPress={requestFullAccessAck}>
              <Text style={styles.allowBtnText}>Demo: tap Allow Full Access</Text>
            </Pressable>
          ) : (
            <Text style={styles.allowedNote}>Permission granted — skills can run in any field.</Text>
          )}
        </View>

        <View style={styles.alert}>
          <Text style={styles.alertTitle}>“Keysor” Would Like Full Access</Text>
          <Text style={styles.alertBody}>
            Full Access lets Keysor run automations and insert results while you type. Keystrokes are
            only processed for the skills you trigger.
          </Text>
          <View style={styles.alertActions}>
            <Pressable onPress={() => setAllowed(false)} style={styles.alertGhost}>
              <Text style={styles.alertGhostText}>Don't Allow</Text>
            </Pressable>
            <Pressable onPress={requestFullAccessAck} style={styles.alertPrimary}>
              <Text style={styles.alertPrimaryText}>Allow</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Text style={styles.section}>Do this on your iPhone</Text>
      <View style={styles.steps}>
        {STEPS.map((item, index) => {
          const active = step === index;
          const done = step > index || (item.id === 3 && allowed);
          return (
            <Pressable
              key={item.id}
              style={[styles.step, active && styles.stepActive, done && styles.stepDone]}
              onPress={() => setStep(index)}
            >
              <View style={[styles.stepBadge, done && styles.stepBadgeDone]}>
                <Text style={styles.stepBadgeText}>{done ? '✓' : item.id}</Text>
              </View>
              <View style={styles.stepCopy}>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepBody}>{item.body}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.primary} onPress={openSettings}>
        <Text style={styles.primaryText}>
          {Platform.OS === 'ios' ? 'Open iOS Settings' : 'Open Settings'}
        </Text>
      </Pressable>

      <Pressable
        style={styles.secondary}
        onPress={() => {
          void Haptics.selectionAsync();
          onOpenDemoKeyboard();
        }}
      >
        <Text style={styles.secondaryText}>Preview keyboard demo in-app</Text>
      </Pressable>

      <Pressable style={styles.continue} onPress={onContinue}>
        <Text style={styles.continueText}>
          {allowed ? "I've enabled Keysor — continue" : 'Continue to app'}
        </Text>
      </Pressable>

      <Text style={styles.footnote}>
        Expo Go cannot install a system keyboard. Install a development build / TestFlight build of
        Keysor so iOS shows Add Keyboard + Full Access. This screen is the exact enable flow after
        that install.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 120,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.textMuted,
  },
  title: {
    marginTop: 8,
    fontSize: 32,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.6,
  },
  lead: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSoft,
  },
  phone: {
    marginTop: 22,
    borderRadius: 28,
    backgroundColor: colors.surface,
    padding: 16,
    shadowColor: colors.shadowStrong,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    gap: 12,
  },
  statusBar: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  settingsTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.ink,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
  },
  settingsRowActive: {
    backgroundColor: colors.accentSoft,
  },
  settingsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  settingsValue: {
    fontSize: 15,
    color: colors.textMuted,
  },
  card: {
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    padding: 14,
    gap: 10,
  },
  cardEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.textMuted,
  },
  keyboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  keyboardName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
  },
  keyboardSub: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textMuted,
  },
  toggle: {
    width: 52,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1D5DB',
    padding: 2,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: '#34C759',
  },
  toggleKnob: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  toggleKnobOn: {
    alignSelf: 'flex-end',
  },
  allowBtn: {
    marginTop: 4,
    backgroundColor: colors.ink,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  allowBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  allowedNote: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: '600',
  },
  alert: {
    borderRadius: 18,
    backgroundColor: '#F7F8FA',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    padding: 14,
    gap: 8,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
  },
  alertBody: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSoft,
    textAlign: 'center',
  },
  alertActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  alertGhost: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#E8EAED',
    alignItems: 'center',
  },
  alertGhostText: {
    fontWeight: '600',
    color: colors.textSoft,
  },
  alertPrimary: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  alertPrimaryText: {
    fontWeight: '700',
    color: '#fff',
  },
  section: {
    marginTop: 24,
    marginBottom: 10,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textMuted,
  },
  steps: {
    gap: 10,
  },
  step: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  stepActive: {
    borderWidth: 1,
    borderColor: colors.accent,
  },
  stepDone: {
    backgroundColor: '#F3FBF6',
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeDone: {
    backgroundColor: '#34C759',
  },
  stepBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  stepCopy: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  stepBody: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSoft,
  },
  primary: {
    marginTop: 22,
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
    backgroundColor: colors.surface,
  },
  secondaryText: {
    color: colors.ink,
    fontWeight: '600',
  },
  continue: {
    marginTop: 10,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.accent,
  },
  continueText: {
    color: '#fff',
    fontWeight: '700',
  },
  footnote: {
    marginTop: 16,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },
});
