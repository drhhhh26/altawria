import { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Image, Alert, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Fonts, Spacing, Radius, EXAM_QUESTION_COUNT, EXAM_DURATION_SECONDS, EXAM_PASS_SCORE } from '../../constants/theme';
import {
  getExamQuestions, getAnswersForQuestion, recordAnswer,
  saveExamSession, QuestionRow, AnswerRow,
} from '../../db/database';
import { ImageMap } from '../../constants/imageMap';

const ANSWER_LABELS = ['أ', 'ب', 'ج', 'د'];

type QWithAnswers = QuestionRow & { answers: AnswerRow[]; selectedIdx: number | null };

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function ExamSession() {
  const { licenseClass } = useLocalSearchParams<{ licenseClass: string }>();
  const [questions, setQuestions] = useState<QWithAnswers[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SECONDS);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    loadExam();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  async function loadExam() {
    const rows = await getExamQuestions(licenseClass, EXAM_QUESTION_COUNT);
    const withAnswers = await Promise.all(
      rows.map(async (q) => ({ ...q, answers: await getAnswersForQuestion(q.id), selectedIdx: null }))
    );
    setQuestions(withAnswers);
    setLoading(false);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          finishExam(withAnswers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  const handleSelectAnswer = (answerIdx: number) => {
    if (finished) return;
    const q = questions[currentIdx];
    if (q.selectedIdx !== null) return;

    const isCorrect = q.answers[answerIdx]?.is_correct === 1;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    recordAnswer(q.id, isCorrect);

    setQuestions(prev => prev.map((item, i) =>
      i === currentIdx ? { ...item, selectedIdx: answerIdx } : item
    ));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      finishExam(questions);
    }
  };

  async function finishExam(qs: QWithAnswers[]) {
    if (timerRef.current) clearInterval(timerRef.current);
    setFinished(true);

    const score = qs.filter(q => {
      if (q.selectedIdx === null) return false;
      return q.answers[q.selectedIdx]?.is_correct === 1;
    }).length;

    const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const passed = score >= EXAM_PASS_SCORE;

    await saveExamSession({ license: licenseClass, score, total: qs.length, passed, durationSeconds });

    router.replace({
      pathname: '/results',
      params: {
        score: String(score),
        total: String(qs.length),
        passed: passed ? '1' : '0',
        duration: String(durationSeconds),
      },
    });
  }

  const handleQuit = () => {
    Alert.alert('إنهاء الامتحان', 'هل تريد الخروج؟ سيُحتسب كرسوب.', [
      { text: 'متابعة الامتحان', style: 'cancel' },
      { text: 'خروج', style: 'destructive', onPress: () => finishExam(questions) },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>جاري تحضير الامتحان...</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Text style={{ fontSize: 48 }}>⚠️</Text>
          <Text style={[styles.loadingText, { textAlign: 'center', marginTop: 16 }]}>
            لم نتمكن من تحميل أسئلة الامتحان.{'\n'}يرجى التحقق من إعدادات الرخصة والمحاولة مرة أخرى.
          </Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 24, padding: 12, backgroundColor: Colors.surface, borderRadius: Radius.md }}>
            <Text style={{ color: Colors.text }}>العودة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const current = questions[currentIdx];
  const answered = questions.filter(q => q.selectedIdx !== null).length;
  const isLowTime = timeLeft < 300;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleQuit} style={styles.quitBtn}>
          <Ionicons name="close" size={24} color={Colors.textMuted} />
        </TouchableOpacity>

        <View style={[styles.timerWrap, isLowTime && styles.timerWrapLow]}>
          <Ionicons name="timer" size={16} color={isLowTime ? Colors.error : Colors.primary} />
          <Text style={[styles.timer, isLowTime && styles.timerLow]}>{formatTime(timeLeft)}</Text>
        </View>

        <Text style={styles.counter}>{currentIdx + 1}/{questions.length}</Text>
      </View>

      {/* Progress dots */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dotsWrap} contentContainerStyle={styles.dots}>
        {questions.map((q, i) => {
          let color = Colors.border;
          if (i === currentIdx) color = Colors.primary;
          else if (q.selectedIdx !== null) color = Colors.success;
          return <View key={i} style={[styles.dot, { backgroundColor: color }]} />;
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.question}>{current.question}</Text>

        {current.image_file && (
          <View style={styles.imageWrap}>
            <Image
              source={ImageMap[current.image_file]}
              style={styles.image}
              resizeMode="contain"
            />
            {current.image_source && (
              <Text style={styles.imageCredit} numberOfLines={1}>© {current.image_source}</Text>
            )}
          </View>
        )}

        <View style={styles.answers}>
          {current.answers.map((answer, idx) => {
            let bg = Colors.surface;
            let borderColor = Colors.border;
            let borderBottomColor = Colors.border;
            let textColor = Colors.text;
            let numBg = Colors.surfaceAlt;
            let numColor = Colors.textSecondary;

            if (current.selectedIdx !== null && idx === current.selectedIdx) {
              const isCorrect = answer.is_correct === 1;
              bg = isCorrect ? Colors.greenBg : Colors.redBg;
              borderColor = isCorrect ? Colors.success : Colors.error;
              borderBottomColor = isCorrect ? Colors.successDark : Colors.errorDark;
              textColor = isCorrect ? Colors.successDark : Colors.errorDark;
              numBg = isCorrect ? Colors.success : Colors.error;
              numColor = '#fff';
            }

            return (
              <TouchableOpacity
                key={answer.id}
                style={[styles.answerBtn, { backgroundColor: bg, borderColor, borderBottomColor }]}
                onPress={() => handleSelectAnswer(idx)}
                activeOpacity={current.selectedIdx !== null ? 1 : 0.85}
              >
                <View style={[styles.answerNum, { backgroundColor: numBg }]}>
                  <Text style={[styles.answerNumText, { color: numColor }]}>
                    {ANSWER_LABELS[idx]}
                  </Text>
                </View>
                <Text style={[styles.answerText, { color: textColor }]}>{answer.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer nav */}
      <View style={styles.footer}>
        <Text style={styles.footerInfo}>{answered} / {questions.length} أجبت</Text>
        <TouchableOpacity
          style={[
            styles.nextBtn,
            current.selectedIdx === null && styles.nextBtnSkip,
          ]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextText}>
            {currentIdx === questions.length - 1 ? 'إنهاء الامتحان' : current.selectedIdx === null ? 'تخطي' : 'التالي'}
          </Text>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  loadingText: { color: Colors.textSecondary, fontSize: Fonts.sizes.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  quitBtn: { padding: Spacing.sm },
  timerWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.tealBg,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.primary + '40',
  },
  timerWrapLow: { backgroundColor: Colors.redBg, borderColor: Colors.error + '40' },
  timer: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.primary, fontVariant: ['tabular-nums'] },
  timerLow: { color: Colors.error },
  counter: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.textSecondary },
  dotsWrap: { maxHeight: 20, paddingHorizontal: Spacing.lg },
  dots: { flexDirection: 'row', gap: 4, alignItems: 'center', paddingVertical: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  body: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 100, gap: Spacing.md },
  question: { fontSize: Fonts.sizes.lg, fontWeight: '600', color: Colors.text, lineHeight: 30, textAlign: 'right', writingDirection: 'rtl' },
  imageWrap: { borderRadius: Radius.md, overflow: 'hidden', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  image: { width: '100%', height: 200 },
  imageCredit: { fontSize: 10, color: Colors.textMuted, padding: Spacing.sm, textAlign: 'right' },
  answers: { gap: Spacing.sm },
  answerBtn: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.md,
    borderRadius: Radius.md, borderWidth: 1.5, borderBottomWidth: 2, gap: Spacing.md,
  },
  answerNum: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  answerNumText: { fontSize: Fonts.sizes.sm, fontWeight: '700' },
  answerText: { flex: 1, fontSize: Fonts.sizes.md, lineHeight: 22, textAlign: 'right', writingDirection: 'rtl' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.lg, backgroundColor: Colors.background,
    borderTopWidth: 1, borderTopColor: Colors.border, gap: Spacing.md,
  },
  footerInfo: { fontSize: Fonts.sizes.sm, color: Colors.textMuted, textAlign: 'right' },
  nextBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, backgroundColor: Colors.secondary,
    borderRadius: Radius.md, paddingVertical: Spacing.md,
    borderBottomWidth: 4, borderBottomColor: Colors.secondaryDark,
  },
  nextBtnSkip: {
    backgroundColor: Colors.surfaceAlt,
    borderBottomColor: Colors.border,
    borderBottomWidth: 2,
  },
  nextText: { fontSize: Fonts.sizes.md, fontWeight: '700', color: '#fff' },
});
