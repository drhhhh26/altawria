import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing, Radius, EXAM_QUESTION_COUNT, EXAM_PASS_SCORE } from '../../constants/theme';
import { useSettings } from '../../store/settingsStore';

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
        <Text style={styles.title}>وضع الامتحان</Text>
        <Text style={styles.subtitle}>محاكاة الامتحان الرسمي</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Ionicons name="help-circle" size={32} color={Colors.primary} />
            <Text style={styles.infoNum}>{EXAM_QUESTION_COUNT}</Text>
            <Text style={styles.infoLabel}>سؤال</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="timer" size={32} color={Colors.secondary} />
            <Text style={styles.infoNum}>40</Text>
            <Text style={styles.infoLabel}>دقيقة</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
            <Text style={styles.infoNum}>{EXAM_PASS_SCORE}</Text>
            <Text style={styles.infoLabel}>للنجاح</Text>
          </View>
        </View>
        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>قواعد الامتحان</Text>
          <Text style={styles.rule}>🎲 أسئلة عشوائية من بنك أسئلتك</Text>
          <Text style={styles.rule}>🔒 لا يمكن العودة للسؤال السابق</Text>
          <Text style={styles.rule}>⏱ المؤقت يبدأ عند الضغط على "ابدأ"</Text>
          <Text style={styles.rule}>✅ ستعرف الإجابة الصحيحة بعد الامتحان</Text>
        </View>
        <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.85}>
          <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.startGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="play" size={24} color="#fff" />
            <Text style={styles.startText}>ابدأ الامتحان</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.lg },
  title: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: Fonts.sizes.md, color: Colors.textSecondary, marginTop: 4 },
  body: { flex: 1, paddingHorizontal: Spacing.lg, gap: Spacing.lg },
  infoGrid: { flexDirection: 'row', gap: Spacing.md },
  infoCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'center', gap: Spacing.xs, borderWidth: 1, borderColor: Colors.border },
  infoNum: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.text },
  infoLabel: { fontSize: Fonts.sizes.sm, color: Colors.textMuted },
  rulesCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  rulesTitle: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.textSecondary, marginBottom: Spacing.xs },
  rule: { fontSize: Fonts.sizes.md, color: Colors.text, lineHeight: 24 },
  startBtn: { borderRadius: Radius.lg, overflow: 'hidden', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  startGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.lg },
  startText: { fontSize: Fonts.sizes.xl, fontWeight: '700', color: '#fff' },
});
