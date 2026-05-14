// Design tokens for التؤوريا
export const Colors = {
  // Primary palette — deep navy + gold
  background:    '#0A0F1E',
  surface:       '#111827',
  surfaceAlt:    '#1C2537',
  border:        '#2A3548',

  primary:       '#F5A623',   // Gold — exam / accent
  primaryDark:   '#C87D0E',
  primaryLight:  '#FFD580',

  secondary:     '#3B82F6',   // Blue — study mode

  success:       '#22C55E',
  error:         '#EF4444',
  warning:       '#F59E0B',

  text:          '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted:     '#475569',

  // Category colors
  categories: {
    'قوانين المرور':    '#3B82F6',   // Blue
    'السلامة على الطرق': '#22C55E',  // Green
    'إشارات المرور':    '#F5A623',   // Gold
    'معرفة المركبة':    '#A855F7',   // Purple
  },
} as const;

export const Fonts = {
  regular: 'System',
  bold:    'System',
  sizes: {
    xs:   11,
    sm:   13,
    md:   15,
    lg:   18,
    xl:   22,
    xxl:  28,
    hero: 36,
  },
} as const;

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;

export const Radius = {
  sm:   8,
  md:   12,
  lg:   20,
  xl:   28,
  full: 999,
} as const;

// License classes available
export const LICENSE_CLASSES = [
  { id: 'B',  label: 'B',  icon: '🚗', description: 'سيارة خاصة' },
  { id: 'A',  label: 'A',  icon: '🏍', description: 'دراجة نارية' },
  { id: 'C',  label: 'C',  icon: '🚛', description: 'شاحنة ثقيلة' },
  { id: 'C1', label: 'C1', icon: '🚚', description: 'شاحنة خفيفة' },
  { id: 'D',  label: 'D',  icon: '🚌', description: 'حافلة' },
  { id: '1',  label: '1',  icon: '🚜', description: 'جرار / خاص' },
] as const;

export type LicenseClass = typeof LICENSE_CLASSES[number]['id'];

export const EXAM_QUESTION_COUNT = 30;
export const EXAM_DURATION_SECONDS = 40 * 60; // 40 minutes
export const EXAM_PASS_SCORE = 26;
