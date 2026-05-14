import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing, Radius, EXAM_QUESTION_COUNT, EXAM_PASS_SCORE } from '../../constants/theme';
import { useSettings } from '../../store/settingsStore';

const EXAM_RULES = [
  'أسئلة عشوائية من بنك أسئلتك',
  'لا يمكن العودة للسؤال السابق',
  'المؤقت يبدأ عند الضغط على "ابدأ"',
  'ستعرف الإجابة الصحيحة بعد الامتحان',
];

export default function ExamTab() {
  const { licenseClass } = useSettings();

  const handleStart = () => {
    Alert.alert(
      'بدء الامتحان',
      `سيبدأ امتحان من ${EXAM_QUESTION_COUNT} سؤالاً.\nوقتك: 40 دقيقة\nللنجاح: ${EXAM_PASS_SCORE}/${EXAM_QUESTION_COUNT} إجابة صحيحة`,
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'ابدأ', onPress: () => router.push({ pathname: '/exam/session', params: { licenseClass } }) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>امتحان</Text>
        <Text style={styles.subtitle}>محاكاة الامتحان الرسمي</Text>
      </View>
      <View style={styles.body}>
        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: Colors.primary }]}>{EXAM_QUESTION_COUNT}</Text>
            <Text style={styles.statLabel}>سؤال</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: Colors.secondary }]}>40</Text>
            <Text style={styles.statLabel}>دقيقة</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: Colors.success }]}>{EXAM_PASS_SCORE}</Text>
            <Text style={styles.statLabel}>للنجاح</Text>
          </View>
        </View>

        {/* Rules card */}
        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>قواعد الامتحان</Text>
          {EXAM_RULES.map((rule, i) => (
            <Text key={i} style={styles.rule}>{i + 1}. {rule}</Text>
          ))}
        </View>

        {/* 3D depth start button */}
        <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.85}>
          <Text style={styles.startText}>ابدأ الامتحان</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  title: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.text, letterSpacing: -0.5, textAlign: 'right' },
  subtitle: { fontSize: Fonts.sizes.md, color: Colors.textSecondary, marginTop: 4, textAlign: 'right' },
  body: { flex: 1, paddingHorizontal: Spacing.lg, gap: Spacing.md },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statNum: { fontSize: Fonts.sizes.xxl, fontWeight: '800' },
  statLabel: { fontSize: Fonts.sizes.sm, color: Colors.textMuted },
  rulesCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  rulesTitle: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.xs, textAlign: 'right' },
  rule: { fontSize: Fonts.sizes.md, color: Colors.text, lineHeight: 26, textAlign: 'right' },
  startBtn: {
    backgroundColor: Colors.secondary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: Colors.secondaryDark,
  },
  startText: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: '#fff' },
});
