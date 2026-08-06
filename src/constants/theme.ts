import { MD3LightTheme } from 'react-native-paper';

export const COLORS = {
  primary: '#0A57A8', // Official Infoline Primary Blue
  primaryDark: '#073C74',
  primaryLight: '#3B82F6',

  accent: '#E31E24', // Official Infoline Primary Red Accent
  accentDark: '#B91C1C',

  background: '#F7F9FC', // Clean Corporate Light Background
  surface: '#FFFFFF',
  surfaceVariant: '#F3F4F6',
  cardBg: '#FFFFFF',
  headerBg: '#0A57A8',
  headerText: '#FFFFFF',

  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textLight: '#FFFFFF',

  border: '#E5E7EB',
  borderDark: '#D1D5DB',
  focusRing: '#0A57A8',

  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  info: '#0A57A8',

  statusApprovedBg: '#DCFCE7',
  statusApprovedText: '#15803D',
  statusPendingBg: '#FEF3C7',
  statusPendingText: '#B45309',
  statusRejectedBg: '#FEE2E2',
  statusRejectedText: '#B91C1C',

  shadowColor: '#1F2937',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16, // 16px Radius for Cards as per guidelines
  xl: 24,
  full: 9999,
};

export const PAPER_THEME = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.accent,
    background: COLORS.background,
    surface: COLORS.surface,
    error: COLORS.danger,
    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#F7F9FC',
      level3: '#F3F4F6',
      level4: '#E5E7EB',
      level5: '#D1D5DB',
    },
  },
};
