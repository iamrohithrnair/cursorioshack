import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

type Props = {
  claimed: boolean;
  onClaim: () => void;
};

const PILLS = [
  { title: 'Notion', sub: 'APP' },
  { title: 'Gmail', sub: 'APP' },
  { title: 'Calendly', sub: 'APP' },
  { title: '100+ Tools', sub: 'API' },
];

export function AccessScreen({ claimed, onClaim }: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Early access</Text>
      <Text style={styles.lead}>
        Keysor turns a third of your screen into an AI action layer. Hold the Keysor bar — get results in place.
      </Text>

      <View style={styles.pills}>
        {PILLS.map((pill) => (
          <View key={pill.title} style={styles.pill}>
            <View style={styles.pillDot} />
            <View>
              <Text style={styles.pillTitle}>{pill.title}</Text>
              <Text style={styles.pillSub}>{pill.sub}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>72-hour launch window</Text>
        <Text style={styles.cardCopy}>
          Lifetime access during launch. No signup or payment required — claim below and we’ll reply with activate steps.
        </Text>
        <Pressable
          style={[styles.cta, claimed && styles.ctaDone]}
          onPress={() => {
            onClaim();
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
          }}
        >
          <Text style={styles.ctaText}>
            {claimed ? "You're on the list" : 'Claim lifetime access'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.ink,
  },
  lead: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 23,
    color: colors.textSoft,
  },
  pills: {
    marginTop: 24,
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  pillDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accentSoft,
  },
  pillTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  pillSub: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  card: {
    marginTop: 28,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 18,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
  },
  cardCopy: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSoft,
  },
  cta: {
    marginTop: 16,
    alignSelf: 'flex-start',
    backgroundColor: colors.ink,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
  },
  ctaDone: {
    backgroundColor: colors.accent,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
