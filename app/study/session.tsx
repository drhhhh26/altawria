import { useEffect, useState, useCallback } from 'react';
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

type QWithAnswers = QuestionRow & { answers: AnswerRow[]; isBookmarked: boolean };

export default function StudySession() {
  const { category, licenseClass } = useLocalSearchParams<{ category: string; licenseClass: string }>();
  const isBookmarks = category === '__bookmarks__';

  const [questions, setQuestions] = useState<QWithAnswers[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, [category, licenseClass]);

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
  const imageFile = current.image_file;
  const imageSource = current.image_source;

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
            color={current.isBookmarked ? Colors.primary : Colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${((currentIdx + 1) / questions.length) * 100}%` as any }]} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Category badge */}
        <Text style={styles.category}>{current.category}</Text>

        {/* Question */}
        <Text style={styles.question}>{current.question}</Text>

        {/* Image */}
        {imageFile && (
          <View style={styles.imageWrap}>
            <Image
              source={ImageMap[imageFile]}
              style={styles.image}
              resizeMode="contain"
            />
            {imageSource && (
              <Text style={styles.imageCredit} numberOfLines={1}>
                © المصدر: {imageSource}
              </Text>
            )}
          </View>
        )}

        {/* Answers */}
        <View style={styles.answers}>
          {current.answers.map((answer, idx) => {
            let bg = Colors.surface;
            let borderColor = Colors.border;
            let textColor = Colors.text;

            if (revealed || selectedAnswer !== null) {
              if (idx === correctIdx) {
                bg = Colors.success + '20';
                borderColor = Colors.success;
                textColor = Colors.success;
              } else if (idx === selectedAnswer && idx !== correctIdx) {
                bg = Colors.error + '20';
                borderColor = Colors.error;
                textColor = Colors.error;
              }
            } else if (idx === selectedAnswer) {
              bg = Colors.primary + '20';
              borderColor = Colors.primary;
            }

            return (
              <TouchableOpacity
                key={answer.id}
                style={[styles.answerBtn, { backgroundColor: bg, borderColor }]}
                onPress={() => handleSelectAnswer(idx)}
                activeOpacity={0.85}
              >
                <View style={[styles.answerNum, { borderColor }]}>
                  <Text style={[styles.answerNumText, { color: textColor }]}>
                    {String.fromCharCode(0x0041 + idx)}
                  </Text>
                </View>
                <Text style={[styles.answerText, { color: textColor }]}>{answer.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Reveal / copyright */}
        {!revealed && selectedAnswer === null && (
          <TouchableOpacity style={styles.revealBtn} onPress={handleReveal} activeOpacity={0.85}>
            <Text style={styles.revealText}>اظهار الإجابة الصحيحة</Text>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  emptyIcon: { fontSize: 64 },
  emptyText: { fontSize: Fonts.sizes.lg, color: Colors.textMuted },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  headerBtn: { padding: Spacing.sm },
  backBtn: { padding: Spacing.lg },
  progress: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.textSecondary },
  progressBar: { height: 4, backgroundColor: Colors.border, marginHorizontal: Spacing.lg },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  body: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: 100, gap: Spacing.md },
  category: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.primary, letterSpacing: 0.5 },
  question: { fontSize: Fonts.sizes.lg, fontWeight: '600', color: Colors.text, lineHeight: 28, textAlign: 'right', writingDirection: 'rtl' },
  imageWrap: { borderRadius: Radius.md, overflow: 'hidden', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  image: { width: '100%', height: 200 },
  imageCredit: { fontSize: 10, color: Colors.textMuted, padding: Spacing.sm, textAlign: 'right' },
  answers: { gap: Spacing.sm },
  answerBtn: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1.5, gap: Spacing.md },
  answerNum: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  answerNumText: { fontSize: Fonts.sizes.sm, fontWeight: '700' },
  answerText: { flex: 1, fontSize: Fonts.sizes.md, lineHeight: 22, textAlign: 'right', writingDirection: 'rtl' },
  revealBtn: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed' },
  revealText: { fontSize: Fonts.sizes.md, color: Colors.textSecondary, fontWeight: '600' },
  nav: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.lg, backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.border, gap: Spacing.md },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, padding: Spacing.md },
  navBtnDisabled: { opacity: 0.4 },
  navText: { fontSize: Fonts.sizes.md, fontWeight: '600', color: Colors.text },
  navBtnNext: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.primary, borderRadius: Radius.md, padding: Spacing.md },
  navNextText: { fontSize: Fonts.sizes.md, fontWeight: '700', color: '#fff' },
});
