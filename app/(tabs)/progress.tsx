import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';
import { useSettings } from '../../store/settingsStore';
import { getCategoryStats, getExamHistory } from '../../db/database';

type CategoryStat = { category: string; total: number; seen: number; correct: number };
type CatEntry = { color: string; bg: string };

export default function ProgressTab() {
  const { licenseClass } = useSettings();
  const [stats, setStats] = useState<CategoryStat[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!licenseClass) return;
    getCategoryStats(licenseClass).then(s => setStats(s as CategoryStat[]));
    getExamHistory().then(setHistory);
  }, [licenseClass]);

  const totalSeen = stats.reduce((a, s) => a + (s.seen || 0), 0);
  const totalCorrect = stats.reduce((a, s) => a + (s.correct || 0), 0);
  const accuracy = totalSeen > 0 ? Math.round((totalCorrect / totalSeen) * 100) : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>إحصائياتي</Text>
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {/* Overview row */}
        <View style={styles.overviewRow}>
          <View style={styles.overviewItem}>
            <Text style={[styles.overviewNum, { color: Colors.primary }]}>{totalSeen}</Text>
            <Text style={styles.overviewLabel}>سؤال درسته</Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={[styles.overviewNum, { color: Colors.success }]}>{accuracy}%</Text>
            <Text style={styles.overviewLabel}>دقة الإجابات</Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={[styles.overviewNum, { color: Colors.secondary }]}>{history.length}</Text>
            <Text style={styles.overviewLabel}>امتحانات</Text>
          </View>
        </View>

        {/* Per category */}
        {stats.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>حسب الموضوع</Text>
            {stats.map(stat => {
              const pct = stat.total > 0 ? Math.round((stat.seen / stat.total) * 100) : 0;
              const acc = stat.seen > 0 ? Math.round((stat.correct / stat.seen) * 100) : 0;
              const catEntry = (Colors.categories as any)[stat.category] as CatEntry | undefined;
              const catColor = catEntry?.color ?? Colors.primary;
              return (
                <View key={stat.category} style={styles.catRow}>
                  <View style={styles.catTop}>
                    <Text style={styles.catName}>{stat.category}</Text>
                    <Text style={[styles.catAcc, { color: catColor }]}>{acc}%</Text>
                  </View>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${pct}%` as any, backgroundColor: catColor }]} />
                  </View>
                  <Text style={styles.catSub}>{stat.seen} / {stat.total} سؤال</Text>
                </View>
              );
            })}
          </>
        )}

        {/* Exam history */}
        {history.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>سجل الامتحانات</Text>
            {history.slice(0, 10).map(exam => (
              <View key={exam.id} style={styles.examRow}>
                <View style={[styles.examDot, { backgroundColor: exam.passed ? Colors.success : Colors.error }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.examScore}>{exam.score}/{exam.total}</Text>
                  <Text style={styles.examDate}>{new Date(exam.taken_at).toLocaleDateString('ar-EG')}</Text>
                </View>
                <View style={[styles.examBadge, { backgroundColor: exam.passed ? Colors.greenBg : Colors.redBg }]}>
                  <Text style={[styles.examBadgeText, { color: exam.passed ? Colors.successDark : Colors.errorDark }]}>
                    {exam.passed ? 'نجحت' : 'لم تنجح'}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        {totalSeen === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>ابدأ الدراسة لترى إحصائياتك هنا</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.lg },
  title: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.text, letterSpacing: -0.5, textAlign: 'right' },
  body: { paddingHorizontal: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl },
  overviewRow: { flexDirection: 'row', gap: Spacing.sm },
  overviewItem: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  overviewNum: { fontSize: Fonts.sizes.xl, fontWeight: '800' },
  overviewLabel: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, textAlign: 'center' },
  sectionTitle: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.textMuted, marginTop: Spacing.sm, textAlign: 'right' },
  catRow: {
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  catTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catName: { fontSize: Fonts.sizes.md, fontWeight: '600', color: Colors.text, textAlign: 'right' },
  catAcc: { fontSize: Fonts.sizes.sm, fontWeight: '700' },
  barBg: { height: 6, backgroundColor: Colors.surfaceAlt, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  catSub: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, textAlign: 'right' },
  examRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  examDot: { width: 8, height: 8, borderRadius: 4 },
  examScore: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text, textAlign: 'right' },
  examDate: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, marginTop: 2, textAlign: 'right' },
  examBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.sm },
  examBadgeText: { fontSize: Fonts.sizes.sm, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.md },
  emptyIcon: { fontSize: 64 },
  emptyText: { fontSize: Fonts.sizes.md, color: Colors.textMuted, textAlign: 'center' },
});
