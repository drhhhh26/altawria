import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  Colors, Fonts, Spacing, Radius,
  LICENSE_CLASSES, type LicenseClass,
} from '../../constants/theme';
import { useSettings } from '../../store/settingsStore';

const FEATURES = [
  { icon: '📚', text: '1800 سؤال رسمي من وزارة المواصلات' },
  { icon: '📊', text: 'تتبع تقدمك سؤالاً بسؤال' },
  { icon: '⏱', text: 'محاكاة الامتحان الرسمي مع مؤقت' },
];

export default function WelcomeScreen() {
  const [step, setStep] = useState<0 | 1>(0);
  const [selected, setSelected] = useState<LicenseClass | null>(null);
  const { setLicenseClass, setOnboardingDone } = useSettings();

  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  function transition(nextStep: 0 | 1) {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -20, duration: 160, useNativeDriver: true }),
    ]).start(() => {
      setStep(nextStep);
      translateY.setValue(24);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 240, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 240, useNativeDriver: true }),
      ]).start();
    });
  }

  function handleSelect(cls: LicenseClass) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(cls);
  }

  async function handleContinue() {
    if (!selected) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await setLicenseClass(selected);
    await setOnboardingDone();
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Animated.View style={[{ flex: 1 }, { opacity, transform: [{ translateY }] }]}>

        {step === 0 ? (
          // ── STEP 0: WELCOME ──────────────────────────────────────────────
          <View style={styles.welcomePage}>
            {/* Hero area */}
            <View style={styles.hero}>
              <View style={styles.iconBox}>
                <Text style={styles.heroEmoji}>🚗</Text>
              </View>
              <Text style={styles.appName}>ألثيوري</Text>
              <Text style={styles.tagline}>
                ادرس لامتحان التؤوريا{'\n'}بطريقة بسيطة، مركّزة وسهلة.
              </Text>
            </View>

            {/* Feature rows */}
            <View style={styles.features}>
              {FEATURES.map(({ icon, text }) => (
                <View key={text} style={styles.featureItem}>
                  <View style={styles.featureIconBox}>
                    <Text style={styles.featureIcon}>{icon}</Text>
                  </View>
                  <Text style={styles.featureText}>{text}</Text>
                </View>
              ))}
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={styles.btn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                transition(1);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.btnText}>ابدأ الآن</Text>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>© وزارة المواصلات الإسرائيلية</Text>
          </View>

        ) : (
          // ── STEP 1: LICENSE SELECTION ─────────────────────────────────────
          <View style={styles.licensePage}>
            <View style={styles.licenseHeader}>
              <Text style={styles.licenseTitle}>اختر نوع الرخصة</Text>
              <Text style={styles.licenseSubtitle}>
                سيتم تخصيص الأسئلة حسب رخصتك
              </Text>
            </View>

            <ScrollView
              contentContainerStyle={styles.grid}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
            >
              {LICENSE_CLASSES.map((cls) => {
                const isActive = selected === cls.id;
                return (
                  <TouchableOpacity
                    key={cls.id}
                    style={[styles.card, isActive && styles.cardActive]}
                    onPress={() => handleSelect(cls.id)}
                    activeOpacity={0.75}
                  >
                    {isActive && (
                      <View style={styles.checkDot}>
                        <Text style={styles.checkMark}>✓</Text>
                      </View>
                    )}
                    <Text style={styles.cardEmoji}>{cls.icon}</Text>
                    <Text style={[styles.cardName, isActive && styles.cardNameActive]}>
                      {cls.description}
                    </Text>
                    <View style={[styles.cardBadge, isActive && styles.cardBadgeActive]}>
                      <Text style={[styles.cardBadgeText, isActive && styles.cardBadgeTextActive]}>
                        {cls.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={[styles.btn, !selected && styles.btnDisabled]}
              onPress={handleContinue}
              disabled={!selected}
              activeOpacity={0.85}
            >
              <Text style={[styles.btnText, !selected && styles.btnTextDisabled]}>
                متابعة
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  // ── Welcome step ─────────────────────────────────────────────────────────
  welcomePage: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    justifyContent: 'space-between',
    gap: Spacing.xl,
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: Spacing.lg,
  },
  iconBox: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: Colors.tealBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  heroEmoji: { fontSize: 50 },
  appName: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -2,
    textAlign: 'center',
  },
  tagline: {
    fontSize: Fonts.sizes.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 30,
  },
  features: { gap: Spacing.sm },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  featureIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.tealBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureIcon: { fontSize: 20 },
  featureText: {
    flex: 1,
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'right',
  },
  disclaimer: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },

  // ── License step ─────────────────────────────────────────────────────────
  licensePage: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: Spacing.lg,
  },
  licenseHeader: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  licenseTitle: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  licenseSubtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  card: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 2,
    borderColor: Colors.border,
    minHeight: 124,
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.tealBg,
    shadowColor: Colors.primary,
    shadowOpacity: 0.15,
  },
  checkDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: '#fff', fontSize: 11, fontWeight: '800' },
  cardEmoji: { fontSize: 36 },
  cardName: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  cardNameActive: { color: Colors.primaryDark },
  cardBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceAlt,
    marginTop: 2,
  },
  cardBadgeActive: { backgroundColor: Colors.primary },
  cardBadgeText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  cardBadgeTextActive: { color: '#fff' },

  // ── Shared button ─────────────────────────────────────────────────────────
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: Colors.primaryDark,
  },
  btnDisabled: {
    backgroundColor: Colors.surfaceAlt,
    borderBottomColor: Colors.border,
    borderBottomWidth: 2,
    shadowOpacity: 0,
    elevation: 0,
  },
  btnText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: '#fff',
  },
  btnTextDisabled: { color: Colors.textMuted },
});
