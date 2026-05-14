import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, RefreshControl, Modal,
} from 'react-native';
import { router } from 'expo-router';
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
  const completionPct = totalQuestions > 0 ? Math.round((totalSeen / totalQuestions) * 100) : 0;

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
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>مرحباً</Text>
            <Text style={styles.appName}>التؤوريا</Text>
          </View>
          {classInfo && (
            <TouchableOpacity style={styles.classBadge} onPress={() => setShowPicker(true)} activeOpacity={0.8}>
              <Text style={styles.classIcon}>{classInfo.icon}</Text>
              <Text style={styles.classLabel}>رخصة {classInfo.label}</Text>
              <Ionicons name="chevron-down" size={14} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.body}>
          {/* Quick actions */}
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors.indigo, borderBottomColor: Colors.indigoDark }]}
              onPress={() => router.push('/(tabs)/study')}
              activeOpacity={0.85}
            >
              <Text style={styles.actionTitle}>دراسة</Text>
              <Text style={styles.actionSub}>تصفح الأسئلة</Text>
              <Text style={styles.actionGhost}>1800</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors.secondary, borderBottomColor: Colors.secondaryDark }]}
              onPress={() => router.push('/(tabs)/exam')}
              activeOpacity={0.85}
            >
              <Text style={styles.actionTitle}>امتحان</Text>
              <Text style={styles.actionSub}>30 سؤال · 40 دقيقة</Text>
              <Text style={styles.actionGhost}>30</Text>
            </TouchableOpacity>
          </View>

          {/* Progress overview */}
          {totalSeen > 0 && (
            <View style={styles.card}>
              <View style={styles.progTop}>
                <Text style={styles.cardTitle}>التقدم الكلي</Text>
                <Text style={styles.progPct}>{completionPct}%</Text>
              </View>
              {/* Progress bar */}
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${completionPct}%` as any }]} />
              </View>
              <View style={styles.progMeta}>
                <Text style={styles.progMetaText}>{totalSeen} سؤال درسته</Text>
                <Text style={styles.progMetaText}>{totalQuestions} إجمالي</Text>
              </View>
            </View>
          )}

          {/* Last exam result */}
          {lastExam && (
            <View style={styles.card}>
              <View style={styles.examTop}>
                <Text style={styles.cardTitle}>آخر امتحان</Text>
                <Text style={styles.examDate}>
                  {new Date(lastExam.taken_at).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
                </Text>
              </View>
              <View style={styles.examResultRow}>
                <Text style={styles.examScore}>
                  {lastExam.score}/{lastExam.total}
                </Text>
                <View style={[styles.examBadge, { backgroundColor: lastExam.passed ? Colors.greenBg : Colors.redBg }]}>
                  <Text style={[styles.examBadgeText, { color: lastExam.passed ? Colors.successDark : Colors.errorDark }]}>
                    {lastExam.passed ? 'نجحت' : 'لم تنجح'}
                  </Text>
                </View>
              </View>
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
    paddingBottom: Spacing.lg,
  },
  greeting: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, textAlign: 'right' },
  appName: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.primary, letterSpacing: -0.5, textAlign: 'right' },
  classBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  classIcon: { fontSize: 18 },
  classLabel: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.text },
  body: { paddingHorizontal: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl },
  row: { flexDirection: 'row', gap: Spacing.sm },
  actionCard: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.xs,
    borderBottomWidth: 4,
    overflow: 'hidden',
    minHeight: 110,
  },
  actionTitle: { fontSize: Fonts.sizes.xl, fontWeight: '800', color: '#fff' },
  actionSub: { fontSize: Fonts.sizes.sm, color: 'rgba(255,255,255,0.75)' },
  actionGhost: {
    position: 'absolute',
    bottom: -4,
    left: 12,
    fontSize: 48,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.12)',
    lineHeight: 56,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.textMuted, textAlign: 'right' },
  progTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  progPct: { fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.text },
  progMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  progMetaText: { fontSize: Fonts.sizes.sm, color: Colors.textMuted, textAlign: 'right' },
  barBg: { height: 8, backgroundColor: Colors.surfaceAlt, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 4 },
  examTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  examDate: { fontSize: Fonts.sizes.sm, color: Colors.textMuted },
  examResultRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  examScore: { fontSize: Fonts.sizes.hero, fontWeight: '800', color: Colors.text },
  examBadge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full },
  examBadgeText: { fontSize: Fonts.sizes.md, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  modalContent: { backgroundColor: Colors.surface, width: '100%', borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 8 },
  modalTitle: { fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: Spacing.sm },
  modalItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, backgroundColor: Colors.background, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, gap: Spacing.md },
  modalItemSelected: { borderColor: Colors.primary, backgroundColor: Colors.tealBg },
  modalItemIcon: { fontSize: 24 },
  modalItemTitle: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text, textAlign: 'right' },
  modalItemDesc: { fontSize: Fonts.sizes.sm, color: Colors.textMuted, textAlign: 'right' },
  modalCloseBtn: { marginTop: Spacing.sm, padding: Spacing.md, alignItems: 'center', backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md },
  modalCloseText: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text },
});
