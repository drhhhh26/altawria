import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius, EXAM_PASS_SCORE, EXAM_QUESTION_COUNT } from '../constants/theme';

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
  const durationSec = parseInt(duration, 10);
  const pct = Math.round((scoreNum / totalNum) * 100);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Result badge */}
        <View style={[styles.badge, { borderColor: isPassed ? Colors.success : Colors.error }]}>
          <Text style={styles.badgeIcon}>{isPassed ? '🎉' : '😔'}</Text>
        </View>

        <Text style={[styles.verdict, { color: isPassed ? Colors.success : Colors.error }]}>
          {isPassed ? 'نجحت!' : 'لم تنجح'}
        </Text>

        {/* Score ring */}
        <View style={styles.scoreWrap}>
          <Text style={styles.scoreNum}>{scoreNum}</Text>
          <Text style={styles.scoreDivider}>من</Text>
          <Text style={styles.scoreTotal}>{totalNum}</Text>
        </View>

        {/* Pass threshold reminder */}
        <Text style={[styles.threshold, { color: isPassed ? Colors.success : Colors.textMuted }]}>
          {isPassed
            ? `أجبت على ${scoreNum} من ${EXAM_PASS_SCORE} المطلوبة ✓`
            : `تحتاج ${EXAM_PASS_SCORE} إجابات صحيحة — أجبت على ${scoreNum}`}
        </Text>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: Colors.success }]}>{scoreNum}</Text>
            <Text style={styles.statLabel}>إجابات صحيحة ✅</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: Colors.error }]}>{totalNum - scoreNum}</Text>
            <Text style={styles.statLabel}>إجابات خاطئة ❌</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: Colors.primary }]}>{pct}%</Text>
            <Text style={styles.statLabel}>النسبة المئوية</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: Colors.secondary }]}>{formatDuration(durationSec)}</Text>
            <Text style={styles.statLabel}>الوقت المستغرق</Text>
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
          <Ionicons name="home-outline" size={20} color={Colors.text} />
          <Text style={styles.secondaryText}>الرئيسية</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.replace('/(tabs)/exam')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.primaryText}>امتحان جديد</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: 120, gap: Spacing.lg, alignItems: 'center' },
  badge: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  badgeIcon: { fontSize: 52 },
  verdict: { fontSize: Fonts.sizes.hero, fontWeight: '900' },
  scoreWrap: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.sm },
  scoreNum: { fontSize: 72, fontWeight: '900', color: Colors.text },
  scoreDivider: { fontSize: Fonts.sizes.xl, color: Colors.textMuted },
  scoreTotal: { fontSize: Fonts.sizes.xxl, fontWeight: '700', color: Colors.textSecondary },
  threshold: { fontSize: Fonts.sizes.md, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, width: '100%' },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: Colors.border },
  statNum: { fontSize: Fonts.sizes.xxl, fontWeight: '800' },
  statLabel: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, textAlign: 'center' },
  msgCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, width: '100%', borderWidth: 1 },
  msg: { fontSize: Fonts.sizes.md, color: Colors.textSecondary, lineHeight: 24, textAlign: 'center' },
  actions: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg, backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.border },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  secondaryText: { fontSize: Fonts.sizes.md, fontWeight: '600', color: Colors.text },
  primaryBtn: { flex: 1, borderRadius: Radius.md, overflow: 'hidden' },
  primaryGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md },
  primaryText: { fontSize: Fonts.sizes.md, fontWeight: '700', color: '#fff' },
});
