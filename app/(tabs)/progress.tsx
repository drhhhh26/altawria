import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';
import { useSettings } from '../../store/settingsStore';
import { getCategoryStats, getExamHistory } from '../../db/database';

type CategoryStat = { category: string; total: number; seen: number; correct: number };

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
        {/* Overall */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>الأداء العام</Text>
          <View style={styles.row}>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: Colors.primary }]}>{totalSeen}</Text>
              <Text style={styles.statLabel}>سؤال درسته</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: Colors.success }]}>{accuracy}%</Text>
              <Text style={styles.statLabel}>دقة الإجابات</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: Colors.secondary }]}>{history.length}</Text>
              <Text style={styles.statLabel}>امتحانات أُجريت</Text>
            </View>
          </View>
        </View>

        {/* Per category */}
        <Text style={styles.sectionTitle}>حسب الموضوع</Text>
        {stats.map(stat => {
          const pct = stat.total > 0 ? Math.round((stat.seen / stat.total) * 100) : 0;
          const acc = stat.seen > 0 ? Math.round((stat.correct / stat.seen) * 100) : 0;
          const catColor = (Colors.categories as any)[stat.category] ?? Colors.primary;
          return (
            <View key={stat.category} style={styles.catCard}>
              <View style={styles.catHeader}>
                <Text style={styles.catName}>{stat.category}</Text>
                <Text style={[styles.catAcc, { color: catColor }]}>{acc}% صحيح</Text>
              </View>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${pct}%` as any, backgroundColor: catColor }]} />
              </View>
              <Text style={styles.catSub}>{stat.seen} / {stat.total} سؤال</Text>
            </View>
          );
        })}

        {/* Exam history */}
        {history.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>سجل الامتحانات</Text>
            {history.slice(0, 10).map(exam => (
              <View key={exam.id} style={styles.examRow}>
                <View style={[styles.examDot, { backgroundColor: exam.passed ? Colors.success : Colors.error }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.examScore}>{exam.score}/{exam.total} — {exam.passed ? 'نجحت ✓' : 'لم تنجح ✗'}</Text>
                  <Text style={styles.examDate}>{new Date(exam.taken_at).toLocaleDateString('ar-EG')}</Text>
                </View>
                <Text style={[styles.examResult, { color: exam.passed ? Colors.success : Colors.error }]}>
                  {Math.round((exam.score / exam.total) * 100)}%
                </Text>
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
  title: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.text },
  body: { paddingHorizontal: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, gap: Spacing.md },
  cardTitle: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.textSecondary },
  row: { flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statNum: { fontSize: Fonts.sizes.xxl, fontWeight: '800' },
  statLabel: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, textAlign: 'center' },
  sectionTitle: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.textSecondary, marginTop: Spacing.sm },
  catCard: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catName: { fontSize: Fonts.sizes.md, fontWeight: '600', color: Colors.text },
  catAcc: { fontSize: Fonts.sizes.sm, fontWeight: '700' },
  barBg: { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  catSub: { fontSize: Fonts.sizes.xs, color: Colors.textMuted },
  examRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  examDot: { width: 10, height: 10, borderRadius: 5 },
  examScore: { fontSize: Fonts.sizes.md, fontWeight: '600', color: Colors.text },
  examDate: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, marginTop: 2 },
  examResult: { fontSize: Fonts.sizes.lg, fontWeight: '800' },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.md },
  emptyIcon: { fontSize: 64 },
  emptyText: { fontSize: Fonts.sizes.md, color: Colors.textMuted, textAlign: 'center' },
});
