import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Image, ActivityIndicator, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';
import {
  getQuestionsByCategory, getAnswersForQuestion, getBookmarkedQuestions,
  toggleBookmark, recordAnswer, QuestionRow, AnswerRow,
} from '../../db/database';
import { ImageMap } from '../../constants/imageMap';

const ANSWER_LABELS = ['أ', 'ب', 'ج', 'د'];

type CatEntry = { color: string; bg: string };
type QWithAnswers = QuestionRow & { answers: AnswerRow[]; isBookmarked: boolean };

export default function StudySession() {
  const { category, licenseClass } = useLocalSearchParams<{ category: string; licenseClass: string }>();
  const isBookmarks = category === '__bookmarks__';

  const [questions, setQuestions] = useState<QWithAnswers[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadQuestions(); }, [category, licenseClass]);

  async function loadQuestions() {
    setLoading(true);
    const rows = isBookmarks
      ? await getBookmarkedQuestions(licenseClass)
      : await getQuestionsByCategory(category, licenseClass);

    const withAnswers = await Promise.all(
      rows.map(async (q) => {
        const answers = await getAnswersForQuestion(q.id);
        return { ...q, answers, isBookmarked: false };
      })
    );
    setQuestions(withAnswers);
    setLoading(false);
  }

  const current = questions[currentIdx];

  const handleSelectAnswer = (idx: number) => {
    if (revealed || selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    const isCorrect = current.answers[idx]?.is_correct === 1;
    Haptics.impactAsync(isCorrect ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Heavy);
    recordAnswer(current.id, isCorrect);
  };

  const handleReveal = () => {
    setRevealed(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
      setSelectedAnswer(null);
      setRevealed(false);
    } else {
      Alert.alert('أحسنت! 🎉', 'لقد أنهيت جميع الأسئلة في هذه الفئة.', [
        { text: 'العودة', onPress: () => router.back() },
      ]);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(i => i - 1);
      setSelectedAnswer(null);
      setRevealed(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!current) return;
    await toggleBookmark(current.id);
    setQuestions(prev =>
      prev.map((q, i) => i === currentIdx ? { ...q, isBookmarked: !q.isBookmarked } : q)
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>لا توجد أسئلة هنا بعد</Text>
        </View>
      </SafeAreaView>
    );
  }

  const correctIdx = current.answers.findIndex(a => a.is_correct === 1);
  const answered = selectedAnswer !== null || revealed;
  const catEntry = (Colors.categories as any)[current.category] as CatEntry | undefined;
  const catColor = catEntry?.color ?? Colors.primary;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.progress}>{currentIdx + 1} / {questions.length}</Text>
        <TouchableOpacity onPress={handleToggleBookmark} style={styles.headerBtn}>
          <Ionicons
            name={current.isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={current.isBookmarked ? Colors.primary : Colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* Category-colored progress bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, {
          width: `${((currentIdx + 1) / questions.length) * 100}%` as any,
          backgroundColor: catColor,
        }]} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Category tag */}
        <Text style={[styles.category, { color: catColor }]}>{current.category}</Text>

        {/* Question */}
        <Text style={styles.question}>{current.question}</Text>

        {/* Image */}
        {current.image_file && (
          <View style={styles.imageWrap}>
            <Image
              source={ImageMap[current.image_file]}
              style={styles.image}
              resizeMode="contain"
            />
            {current.image_source && (
              <Text style={styles.imageCredit} numberOfLines={1}>
                © المصدر: {current.image_source}
              </Text>
            )}
          </View>
        )}

        {/* Answers */}
        <View style={styles.answers}>
          {current.answers.map((answer, idx) => {
            const isCorrect = idx === correctIdx;
            const isWrongSelected = idx === selectedAnswer && !isCorrect;

            let bg = Colors.surface;
            let borderColor = Colors.border;
            let borderBottomColor = Colors.border;
            let textColor = Colors.text;
            let numBg = Colors.surfaceAlt;
            let numColor = Colors.textSecondary;

            if (answered) {
              if (isCorrect) {
                bg = Colors.greenBg;
                borderColor = Colors.success;
                borderBottomColor = Colors.successDark;
                textColor = Colors.successDark;
                numBg = Colors.success;
                numColor = '#fff';
              } else if (isWrongSelected) {
                bg = Colors.redBg;
                borderColor = Colors.error;
                borderBottomColor = Colors.errorDark;
                textColor = Colors.errorDark;
                numBg = Colors.error;
                numColor = '#fff';
              }
            } else if (idx === selectedAnswer) {
              borderColor = Colors.primary;
              borderBottomColor = Colors.primaryDark;
            }

            return (
              <TouchableOpacity
                key={answer.id}
                style={[styles.answerBtn, { backgroundColor: bg, borderColor, borderBottomColor }]}
                onPress={() => handleSelectAnswer(idx)}
                activeOpacity={0.85}
              >
                <View style={[styles.answerNum, { backgroundColor: numBg }]}>
                  <Text style={[styles.answerNumText, { color: numColor }]}>
                    {ANSWER_LABELS[idx]}
                  </Text>
                </View>
                <Text style={[styles.answerText, { color: textColor, fontWeight: answered && (isCorrect || isWrongSelected) ? '600' : '400' }]}>
                  {answer.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Reveal button */}
        {!revealed && selectedAnswer === null && (
          <TouchableOpacity style={styles.revealBtn} onPress={handleReveal} activeOpacity={0.85}>
            <Text style={styles.revealText}>إظهار الإجابة الصحيحة</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.nav}>
        <TouchableOpacity
          style={[styles.navBtn, currentIdx === 0 && styles.navBtnDisabled]}
          onPress={handlePrev}
          disabled={currentIdx === 0}
        >
          <Ionicons name="arrow-forward" size={22} color={currentIdx === 0 ? Colors.textMuted : Colors.text} />
          <Text style={[styles.navText, currentIdx === 0 && { color: Colors.textMuted }]}>السابق</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navBtnNext} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.navNextText}>
            {currentIdx === questions.length - 1 ? 'إنهاء' : 'التالي'}
          </Text>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, backgroundColor: Colors.background },
  emptyIcon: { fontSize: 64 },
  emptyText: { fontSize: Fonts.sizes.lg, color: Colors.textMuted },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  headerBtn: { padding: Spacing.sm },
  backBtn: { padding: Spacing.lg },
  progress: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.textSecondary },
  progressBarBg: { height: 4, backgroundColor: Colors.surfaceAlt, marginHorizontal: Spacing.lg },
  progressBarFill: { height: '100%', borderRadius: 2 },
  body: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: 100, gap: Spacing.md },
  category: { fontSize: Fonts.sizes.sm, fontWeight: '700', letterSpacing: 0.3, textAlign: 'right' },
  question: { fontSize: Fonts.sizes.lg, fontWeight: '600', color: Colors.text, lineHeight: 30, textAlign: 'right', writingDirection: 'rtl' },
  imageWrap: { borderRadius: Radius.md, overflow: 'hidden', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  image: { width: '100%', height: 200 },
  imageCredit: { fontSize: 10, color: Colors.textMuted, padding: Spacing.sm, textAlign: 'right' },
  answers: { gap: Spacing.sm },
  answerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderBottomWidth: 2,
    gap: Spacing.md,
  },
  answerNum: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  answerNumText: { fontSize: Fonts.sizes.sm, fontWeight: '700' },
  answerText: { flex: 1, fontSize: Fonts.sizes.md, lineHeight: 22, textAlign: 'right', writingDirection: 'rtl' },
  revealBtn: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderBottomWidth: 2,
    borderBottomColor: Colors.borderStrong,
  },
  revealText: { fontSize: Fonts.sizes.md, color: Colors.textSecondary, fontWeight: '600', textAlign: 'right' },
  nav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.md,
  },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, padding: Spacing.md },
  navBtnDisabled: { opacity: 0.4 },
  navText: { fontSize: Fonts.sizes.md, fontWeight: '600', color: Colors.text },
  navBtnNext: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderBottomWidth: 4,
    borderBottomColor: Colors.primaryDark,
  },
  navNextText: { fontSize: Fonts.sizes.md, fontWeight: '700', color: '#fff' },
});
