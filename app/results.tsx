import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing, Radius, EXAM_PASS_SCORE } from '../constants/theme';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ResultsScreen() {
  const { score, total, passed, duration } = useLocalSearchParams<{
    score: string; total: string; passed: string; duration: string;
  }>();

  const scoreNum = parseInt(score, 10);
  const totalNum = parseInt(total, 10);
  const isPassed = passed === '1';
  const pct = Math.round((scoreNum / totalNum) * 100);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Emoji result badge */}
        <View style={[styles.badge, { borderColor: isPassed ? Colors.success : Colors.error }]}>
          <Text style={styles.badgeIcon}>{isPassed ? '🎉' : '😔'}</Text>
        </View>

        <Text style={[styles.verdict, { color: isPassed ? Colors.success : Colors.error }]}>
          {isPassed ? 'نجحت!' : 'لم تنجح'}
        </Text>

        {/* Score display */}
        <View style={styles.scoreWrap}>
          <Text style={styles.scoreNum}>{scoreNum}</Text>
          <Text style={styles.scoreSep}>/</Text>
          <Text style={styles.scoreTotal}>{totalNum}</Text>
        </View>

        <Text style={[styles.threshold, { color: isPassed ? Colors.success : Colors.textMuted }]}>
          {isPassed
            ? `أجبت على ${scoreNum} من ${EXAM_PASS_SCORE} المطلوبة ✓`
            : `تحتاج ${EXAM_PASS_SCORE} إجابات صحيحة — أجبت على ${scoreNum}`}
        </Text>

        {/* Stats — 3 items (correct / wrong / pct) */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: Colors.success }]}>{scoreNum}</Text>
            <Text style={styles.statLabel}>صحيحة</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: Colors.error }]}>{totalNum - scoreNum}</Text>
            <Text style={styles.statLabel}>خاطئة</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: Colors.primary }]}>{pct}%</Text>
            <Text style={styles.statLabel}>النسبة</Text>
          </View>
        </View>

        {/* Motivational message */}
        <View style={[styles.msgCard, { borderColor: isPassed ? Colors.success + '40' : Colors.warning + '40' }]}>
          <Text style={styles.msg}>
            {isPassed
              ? 'أداء ممتاز! حافظ على هذا المستوى وستنجح في الامتحان الحقيقي.'
              : 'لا تيأس! راجع الأسئلة التي أخطأت فيها وحاول مجدداً. التكرار هو مفتاح النجاح.'}
          </Text>
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryText}>الرئيسية</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.replace('/(tabs)/exam')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryText}>امتحان جديد</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  body: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: 120,
    gap: Spacing.lg,
    alignItems: 'center',
  },
  badge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: { fontSize: 52 },
  verdict: { fontSize: Fonts.sizes.hero, fontWeight: '900' },
  scoreWrap: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.xs },
  scoreNum: { fontSize: 64, fontWeight: '900', color: Colors.text },
  scoreSep: { fontSize: Fonts.sizes.xl, color: Colors.textMuted },
  scoreTotal: { fontSize: Fonts.sizes.xxl, fontWeight: '700', color: Colors.textSecondary },
  threshold: { fontSize: Fonts.sizes.md, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, width: '100%' },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statNum: { fontSize: Fonts.sizes.xl, fontWeight: '800' },
  statLabel: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, textAlign: 'center' },
  msgCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    width: '100%',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  msg: { fontSize: Fonts.sizes.md, color: Colors.textSecondary, lineHeight: 24, textAlign: 'center' },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.lg,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderBottomWidth: 2,
    borderBottomColor: Colors.borderStrong,
  },
  secondaryText: { fontSize: Fonts.sizes.md, fontWeight: '600', color: Colors.text },
  primaryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 4,
    borderBottomColor: Colors.secondaryDark,
  },
  primaryText: { fontSize: Fonts.sizes.md, fontWeight: '700', color: '#fff' },
});
