// Design tokens for التؤوريا — v2 (light theme, Duolingo-inspired)
export const Colors = {
  // Base surfaces — light theme
  background:    '#FAFAF8',
  surface:       '#FFFFFF',
  surfaceAlt:    '#F3F4F6',
  border:        '#E5E7EB',
  borderStrong:  '#D1D5DB',

  // Primary — Teal (brand, active states, progress)
  primary:       '#14B8A6',
  primaryDark:   '#0D9488',
  primaryLight:  '#5EEAD4',

  // Secondary — Orange (exam mode, energy)
  secondary:     '#F97316',
  secondaryDark: '#EA580C',

  // Study mode — Indigo
  indigo:        '#6366F1',
  indigoDark:    '#4F46E5',

  // Accent
  pink:          '#EC4899',

  // Semantic
  success:       '#22C55E',
  successDark:   '#16A34A',
  error:         '#EF4444',
  errorDark:     '#DC2626',
  warning:       '#F59E0B',

  // Text
  text:          '#1A1B23',
  textSecondary: '#6B7280',
  textMuted:     '#9CA3AF',

  // Semantic background tints (badges, answer feedback)
  tealBg:        '#CCFBF1',
  orangeBg:      '#FFF7ED',
  indigoBg:      '#EEF2FF',
  pinkBg:        '#FDF2F8',
  greenBg:       '#F0FDF4',
  redBg:         '#FEF2F2',
  amberBg:       '#FFFBEB',

  // Question categories — color + background tint
  categories: {
    'قوانين المرور':     { color: '#6366F1', bg: '#EEF2FF' },
    'السلامة على الطرق': { color: '#14B8A6', bg: '#CCFBF1' },
    'إشارات المرور':     { color: '#F97316', bg: '#FFF7ED' },
    'معرفة المركبة':     { color: '#EC4899', bg: '#FDF2F8' },
  },
} as const;

export const Fonts = {
  regular: 'System',
  bold:    'System',
  sizes: {
    xs:   12,
    sm:   14,
    md:   16,
    lg:   20,
    xl:   24,
    xxl:  32,
    hero: 40,
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
  sm:   12,
  md:   16,
  lg:   24,
  xl:   32,
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
