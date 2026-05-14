import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Fonts, Spacing, Radius, LICENSE_CLASSES, type LicenseClass } from '../../constants/theme';
import { useSettings } from '../../store/settingsStore';
import { getDb } from '../../db/database';

export default function ReadyScreen() {
  const { cls } = useLocalSearchParams<{ cls: LicenseClass }>();
  const { setOnboardingDone } = useSettings();
  const [questionCount, setQuestionCount] = useState<number | null>(null);

  const classInfo = LICENSE_CLASSES.find(c => c.id === cls);

  useEffect(() => {
    async function loadCount() {
      const db = getDb();
      const row = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(DISTINCT q.id) as count FROM questions q
         JOIN question_classes qc ON q.id = qc.question_id
         WHERE qc.class_name = ?`,
        [cls]
      );
      setQuestionCount(row?.count ?? 0);
    }
    if (cls) loadCount();
  }, [cls]);

  const handleStart = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await setOnboardingDone();
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0F1E', '#111827']}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.content}>
        {/* Success badge */}
        <View style={styles.badge}>
          <LinearGradient
            colors={[Colors.success + '30', Colors.success + '10']}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={styles.badgeIcon}>✅</Text>
        </View>

        <Text style={styles.congrats}>ممتاز!</Text>
        <Text style={styles.title}>جاهز للبدء</Text>

        {classInfo && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>{classInfo.icon}</Text>
            <View>
              <Text style={styles.summaryLabel}>رخصة {classInfo.label} — {classInfo.description}</Text>
              {questionCount !== null && (
                <Text style={styles.summaryCount}>
                  {questionCount.toLocaleString('ar-EG')} سؤال مخصص لك
                </Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoRow}>⏱ كل امتحان: 30 سؤال / 40 دقيقة</Text>
          <Text style={styles.infoRow}>✅ للنجاح: 26 إجابة صحيحة من 30</Text>
          <Text style={styles.infoRow}>📚 وضع الدراسة: بدون ضغط الوقت</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={handleStart} activeOpacity={0.85}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.btnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.btnText}>ابدأ الدراسة 🚀</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  badge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.success + '50',
  },
  badgeIcon: { fontSize: 48 },
  congrats: {
    fontSize: Fonts.sizes.hero,
    fontWeight: '800',
    color: Colors.primary,
  },
  title: {
    fontSize: Fonts.sizes.xl,
    color: Colors.textSecondary,
    marginTop: -Spacing.md,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    gap: Spacing.md,
    width: '100%',
  },
  summaryIcon: { fontSize: 36 },
  summaryLabel: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text },
  summaryCount: { fontSize: Fonts.sizes.sm, color: Colors.primary, marginTop: 4 },
  infoBox: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    width: '100%',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: { fontSize: Fonts.sizes.md, color: Colors.text, lineHeight: 24 },
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
