import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, RefreshControl, Modal,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius, LICENSE_CLASSES, LicenseClass } from '../../constants/theme';
import { useSettings } from '../../store/settingsStore';
import { getCategoryStats, getExamHistory } from '../../db/database';
import { SafeAreaView } from 'react-native-safe-area-context';

type CategoryStat = { category: string; total: number; seen: number; correct: number };

export default function HomeScreen() {
  const { licenseClass, setLicenseClass } = useSettings();
  const [stats, setStats] = useState<CategoryStat[]>([]);
  const [lastExam, setLastExam] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const classInfo = LICENSE_CLASSES.find(c => c.id === licenseClass);

  async function loadData() {
    if (!licenseClass) return;
    const [s, exams] = await Promise.all([
      getCategoryStats(licenseClass),
      getExamHistory(),
    ]);
    setStats(s as CategoryStat[]);
    setLastExam(exams[0] ?? null);
  }

  useEffect(() => { loadData(); }, [licenseClass]);

  const totalSeen = stats.reduce((acc, s) => acc + (s.seen || 0), 0);
  const totalQuestions = stats.reduce((acc, s) => acc + s.total, 0);
  const totalCorrect = stats.reduce((acc, s) => acc + (s.correct || 0), 0);
  const overallPct = totalSeen > 0 ? Math.round((totalCorrect / totalSeen) * 100) : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* License Picker Modal */}
      <Modal visible={showPicker} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>اختر فئة الرخصة</Text>
            {LICENSE_CLASSES.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.modalItem, licenseClass === c.id && styles.modalItemSelected]}
                onPress={() => {
                  setLicenseClass(c.id);
                  setShowPicker(false);
                }}
              >
                <Text style={styles.modalItemIcon}>{c.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalItemTitle, licenseClass === c.id && { color: Colors.primary }]}>رخصة {c.label}</Text>
                  <Text style={styles.modalItemDesc}>{c.description}</Text>
                </View>
                {licenseClass === c.id && <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowPicker(false)}>
              <Text style={styles.modalCloseText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <LinearGradient
          colors={['#111827', Colors.background]}
          style={styles.header}
        >
          <View>
            <Text style={styles.greeting}>مرحباً! 👋</Text>
            <Text style={styles.appName}>التؤوريا</Text>
          </View>
          {classInfo && (
            <TouchableOpacity style={styles.classBadge} onPress={() => setShowPicker(true)} activeOpacity={0.8}>
              <Text style={styles.classIcon}>{classInfo.icon}</Text>
              <Text style={styles.classLabel}>رخصة {classInfo.label}</Text>
              <Ionicons name="chevron-down" size={14} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </LinearGradient>

        <View style={styles.body}>
          {/* Quick actions */}
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors.secondary + '20', borderColor: Colors.secondary + '50' }]}
              onPress={() => router.push('/(tabs)/study')}
              activeOpacity={0.85}
            >
              <Ionicons name="book" size={32} color={Colors.secondary} />
              <Text style={[styles.actionTitle, { color: Colors.secondary }]}>دراسة</Text>
              <Text style={styles.actionSub}>تصفح الأسئلة</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors.primary + '20', borderColor: Colors.primary + '50' }]}
              onPress={() => router.push('/(tabs)/exam')}
              activeOpacity={0.85}
            >
              <Ionicons name="timer" size={32} color={Colors.primary} />
              <Text style={[styles.actionTitle, { color: Colors.primary }]}>امتحان</Text>
              <Text style={styles.actionSub}>30 سؤال / 40 دقيقة</Text>
            </TouchableOpacity>
          </View>

          {/* Progress overview */}
          {totalSeen > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>تقدمك الإجمالي</Text>
              <View style={styles.progressRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{totalSeen}</Text>
                  <Text style={styles.statLabel}>سؤال تمت دراسته</Text>
                </View>
                <View style={[styles.statBox, styles.statBoxMid]}>
                  <Text style={[styles.statNum, { color: Colors.primary }]}>{overallPct}%</Text>
                  <Text style={styles.statLabel}>نسبة الإجابات الصحيحة</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{totalQuestions}</Text>
                  <Text style={styles.statLabel}>إجمالي الأسئلة</Text>
                </View>
              </View>
              {/* Progress bar */}
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${Math.round((totalSeen / totalQuestions) * 100)}%` as any }]} />
              </View>
              <Text style={styles.barLabel}>
                {Math.round((totalSeen / totalQuestions) * 100)}% من البنك مكتمل
              </Text>
            </View>
          )}

          {/* Last exam result */}
          {lastExam && (
            <View style={[styles.card, { borderColor: lastExam.passed ? Colors.success + '40' : Colors.error + '40' }]}>
              <Text style={styles.cardTitle}>آخر امتحان</Text>
              <View style={styles.examResultRow}>
                <Text style={styles.examScore}>
                  {lastExam.score}/{lastExam.total}
                </Text>
                <View style={[styles.examBadge, { backgroundColor: lastExam.passed ? Colors.success + '20' : Colors.error + '20' }]}>
                  <Text style={[styles.examBadgeText, { color: lastExam.passed ? Colors.success : Colors.error }]}>
                    {lastExam.passed ? 'نجحت ✓' : 'لم تنجح ✗'}
                  </Text>
                </View>
              </View>
              <Text style={styles.examDate}>
                {new Date(lastExam.taken_at).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  greeting: { fontSize: Fonts.sizes.md, color: Colors.textSecondary },
  appName: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.text, marginTop: 2 },
  classBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  classIcon: { fontSize: 18 },
  classLabel: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.text },
  body: { paddingHorizontal: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl },
  row: { flexDirection: 'row', gap: Spacing.md },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
  },
  actionTitle: { fontSize: Fonts.sizes.xl, fontWeight: '800' },
  actionSub: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, textAlign: 'center' },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  cardTitle: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.textSecondary },
  progressRow: { flexDirection: 'row' },
  statBox: { flex: 1, alignItems: 'center', gap: 4 },
  statBoxMid: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.border,
  },
  statNum: { fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, textAlign: 'center' },
  barBg: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  barLabel: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, textAlign: 'center' },
  examResultRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  examScore: { fontSize: Fonts.sizes.hero, fontWeight: '800', color: Colors.text },
  examBadge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full },
  examBadgeText: { fontSize: Fonts.sizes.md, fontWeight: '700' },
  examDate: { fontSize: Fonts.sizes.sm, color: Colors.textMuted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  modalContent: { backgroundColor: Colors.surface, width: '100%', borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  modalTitle: { fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: Spacing.sm },
  modalItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, backgroundColor: Colors.background, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.md },
  modalItemSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary + '15' },
  modalItemIcon: { fontSize: 24 },
  modalItemTitle: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text, textAlign: 'left' },
  modalItemDesc: { fontSize: Fonts.sizes.sm, color: Colors.textMuted, textAlign: 'left' },
  modalCloseBtn: { marginTop: Spacing.sm, padding: Spacing.md, alignItems: 'center', backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md },
  modalCloseText: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text },
});
