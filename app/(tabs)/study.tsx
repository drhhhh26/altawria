import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';
import { useSettings } from '../../store/settingsStore';
import { getCategoryStats } from '../../db/database';

const CATEGORY_ICONS: Record<string, string> = {
  'قوانين المرور':     '📋',
  'السلامة على الطرق': '⚠️',
  'إشارات المرور':    '🛑',
  'معرفة المركبة':    '🔧',
};

type CategoryStat = { category: string; total: number; seen: number; correct: number };

export default function StudyTab() {
  const { licenseClass } = useSettings();
  const [stats, setStats] = useState<CategoryStat[]>([]);

  useEffect(() => {
    if (licenseClass) getCategoryStats(licenseClass).then(s => setStats(s as CategoryStat[]));
  }, [licenseClass]);

  const handleCategory = (category: string) => {
    router.push({ pathname: '/study/session', params: { category, licenseClass } });
  };

  const handleBookmarks = () => {
    router.push({ pathname: '/study/session', params: { category: '__bookmarks__', licenseClass } });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>وضع الدراسة</Text>
        <Text style={styles.subtitle}>اختر موضوعاً للبدء</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {stats.map((stat) => {
          const pct = stat.seen > 0 ? Math.round((stat.correct / stat.seen) * 100) : null;
          const progress = Math.round((stat.seen / stat.total) * 100);
          const catColor = (Colors.categories as any)[stat.category] ?? Colors.primary;

          return (
            <TouchableOpacity
              key={stat.category}
              style={styles.card}
              onPress={() => handleCategory(stat.category)}
              activeOpacity={0.85}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.catIcon}>{CATEGORY_ICONS[stat.category] ?? '📚'}</Text>
                <View style={styles.catInfo}>
                  <Text style={styles.catName}>{stat.category}</Text>
                  <Text style={styles.catCount}>{stat.total} سؤال</Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                {pct !== null ? (
                  <View style={[styles.pctBadge, { backgroundColor: catColor + '20' }]}>
                    <Text style={[styles.pctText, { color: catColor }]}>{pct}%</Text>
                  </View>
                ) : (
                  <View style={styles.newBadge}>
                    <Text style={styles.newText}>جديد</Text>
                  </View>
                )}
                <Ionicons name="chevron-back" size={18} color={Colors.textMuted} />
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Bookmarks shortcut */}
        <TouchableOpacity style={[styles.card, styles.bookmarkCard]} onPress={handleBookmarks} activeOpacity={0.85}>
          <View style={styles.cardLeft}>
            <Text style={styles.catIcon}>🔖</Text>
            <View style={styles.catInfo}>
              <Text style={styles.catName}>المحفوظات</Text>
              <Text style={styles.catCount}>الأسئلة المحفوظة</Text>
            </View>
          </View>
          <Ionicons name="chevron-back" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  title: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: Fonts.sizes.md, color: Colors.textSecondary, marginTop: 4 },
  body: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bookmarkCard: { borderColor: Colors.primary + '30', borderStyle: 'dashed' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  catIcon: { fontSize: 32 },
  catInfo: { gap: 4 },
  catName: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text },
  catCount: { fontSize: Fonts.sizes.sm, color: Colors.textMuted },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  pctBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  pctText: { fontSize: Fonts.sizes.sm, fontWeight: '700' },
  newBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.secondary + '20',
  },
  newText: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.secondary },
});
