import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Fonts, Spacing, Radius, LICENSE_CLASSES, type LicenseClass } from '../../constants/theme';
import { useSettings } from '../../store/settingsStore';

const { width } = Dimensions.get('window');

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
      <LinearGradient
        colors={['#0A0F1E', '#111827']}
        style={StyleSheet.absoluteFillObject}
      />

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
              {isSelected && (
                <LinearGradient
                  colors={[Colors.primary + '30', Colors.primary + '10']}
                  style={StyleSheet.absoluteFillObject}
                />
              )}
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
          <LinearGradient
            colors={selected ? [Colors.primary, Colors.primaryDark] : [Colors.border, Colors.border]}
            style={styles.btnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.btnText}>متابعة</Text>
          </LinearGradient>
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
    letterSpacing: 1,
  },
  title: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
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
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: Colors.primary,
  },
  icon: { fontSize: 36 },
  cardText: { flex: 1 },
  classLabel: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  classLabelSelected: { color: Colors.primary },
  classDesc: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
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
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  btnDisabled: { shadowOpacity: 0, elevation: 0 },
  btnGradient: {
    paddingVertical: Spacing.md + 4,
    alignItems: 'center',
  },
  btnText: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    color: '#fff',
  },
});
