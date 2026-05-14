import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Fonts, Spacing, Radius, LICENSE_CLASSES, type LicenseClass } from '../../constants/theme';
import { useSettings } from '../../store/settingsStore';

export default function LicenseQuizScreen() {
  const [selected, setSelected] = useState<LicenseClass | null>(null);
  const { setLicenseClass } = useSettings();

  const handleSelect = (cls: LicenseClass) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(cls);
  };

  const handleContinue = async () => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setLicenseClass(selected);
    router.push({ pathname: '/onboarding/ready', params: { cls: selected } });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.step}>الخطوة 1 من 2</Text>
        <Text style={styles.title}>أي رخصة تستعد لها؟</Text>
        <Text style={styles.subtitle}>
          سيتم تخصيص الأسئلة بناءً على نوع الرخصة
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {LICENSE_CLASSES.map((cls) => {
          const isSelected = selected === cls.id;
          return (
            <TouchableOpacity
              key={cls.id}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => handleSelect(cls.id)}
              activeOpacity={0.85}
            >
              <Text style={styles.icon}>{cls.icon}</Text>
              <View style={styles.cardText}>
                <Text style={[styles.classLabel, isSelected && styles.classLabelSelected]}>
                  رخصة {cls.label}
                </Text>
                <Text style={styles.classDesc}>{cls.description}</Text>
              </View>
              {isSelected && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btn, !selected && styles.btnDisabled]}
          onPress={handleContinue}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <Text style={[styles.btnText, !selected && styles.btnTextDisabled]}>متابعة</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    alignItems: 'center',
  },
  step: {
    color: Colors.primary,
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  grid: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderBottomWidth: 2,
    borderBottomColor: Colors.borderStrong,
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardSelected: {
    borderColor: Colors.primary,
    borderBottomColor: Colors.primaryDark,
    backgroundColor: Colors.tealBg,
  },
  icon: { fontSize: 36 },
  cardText: { flex: 1 },
  classLabel: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  classLabelSelected: { color: Colors.primary },
  classDesc: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'right',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md + 4,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: Colors.primaryDark,
  },
  btnDisabled: {
    backgroundColor: Colors.surfaceAlt,
    borderBottomColor: Colors.border,
    borderBottomWidth: 2,
  },
  btnText: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    color: '#fff',
  },
  btnTextDisabled: { color: Colors.textMuted },
});
