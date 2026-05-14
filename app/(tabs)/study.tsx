import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';
import { useSettings } from '../../store/settingsStore';
import { getCategoryStats } from '../../db/database';

type CategoryStat = { category: string; total: number; seen: number; correct: number };

type CatEntry = { color: string; bg: string };

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
        <Text style={styles.title}>دراسة</Text>
        <Text style={styles.subtitle}>اختر موضوعاً للبدء</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {stats.map((stat) => {
          const pct = stat.seen > 0 ? Math.round((stat.correct / stat.seen) * 100) : null;
          const catEntry = (Colors.categories as any)[stat.category] as CatEntry | undefined;
          const catColor = catEntry?.color ?? Colors.primary;
          const catBg = catEntry?.bg ?? Colors.tealBg;

          return (
            <TouchableOpacity
              key={stat.category}
              style={[styles.item, { borderRightColor: catColor }]}
              onPress={() => handleCategory(stat.category)}
              activeOpacity={0.85}
            >
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{stat.category}</Text>
                <Text style={styles.itemCount}>{stat.total} سؤال</Text>
              </View>
              {pct !== null ? (
                <View style={[styles.badge, { backgroundColor: catBg }]}>
                  <Text style={[styles.badgeText, { color: catColor }]}>{pct}%</Text>
                </View>
              ) : (
                <View style={[styles.badge, { backgroundColor: catBg }]}>
                  <Text style={[styles.badgeText, { color: catColor }]}>جديد</Text>
                </View>
              )}
              <Ionicons name="chevron-back" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          );
        })}

        {/* Bookmarks shortcut */}
        <TouchableOpacity style={[styles.item, styles.bookmarkItem]} onPress={handleBookmarks} activeOpacity={0.85}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>المحفوظات</Text>
            <Text style={styles.itemCount}>الأسئلة المحفوظة</Text>
          </View>
          <Ionicons name="bookmark-outline" size={20} color={Colors.primary} />
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
  title: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.text, letterSpacing: -0.5, textAlign: 'right' },
  subtitle: { fontSize: Fonts.sizes.md, color: Colors.textSecondary, marginTop: 4, textAlign: 'right' },
  body: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
    paddingBottom: Spacing.xxl,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderRightWidth: 4,
    borderRightColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  bookmarkItem: {
    borderRightColor: Colors.primary,
    marginTop: Spacing.sm,
  },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text, textAlign: 'right' },
  itemCount: { fontSize: Fonts.sizes.sm, color: Colors.textMuted, textAlign: 'right' },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  badgeText: { fontSize: Fonts.sizes.sm, fontWeight: '700' },
});
