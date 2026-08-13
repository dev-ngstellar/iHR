import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/theme';

interface LogoProps {
  variant?: 'large' | 'small' | 'header';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = React.memo(({ variant = 'large', showSubtitle = true }) => {
  const isLarge = variant === 'large';
  const isHeader = variant === 'header';

  if (isHeader) {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>iHR</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.iconBox, isLarge ? styles.iconBoxLarge : styles.iconBoxSmall]}>
        <View style={styles.iconCircleOuter}>
          <View style={styles.iconCircleInner}>
            <Text style={[styles.iconText, isLarge ? styles.iconTextLarge : styles.iconTextSmall]}>
              iHR
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.brandTitle, isLarge ? styles.brandTitleLarge : styles.brandTitleSmall]}>
          iHR <Text style={styles.brandAccent}>Wallet</Text>
        </Text>
        {showSubtitle && isLarge && (
          <Text style={styles.subtitle}>Enterprise HR & Employee Self-Service</Text>
        )}
      </View>
    </View>
  );
});

Logo.displayName = 'Logo';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  iconBox: {
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  iconBoxLarge: {
    width: 90,
    height: 90,
    marginBottom: 16,
  },
  iconBoxSmall: {
    width: 44,
    height: 44,
    marginBottom: 6,
  },
  iconCircleOuter: {
    width: '80%',
    height: '80%',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleInner: {
    width: '85%',
    height: '85%',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  iconTextLarge: {
    fontSize: 22,
  },
  iconTextSmall: {
    fontSize: 12,
  },
  textContainer: {
    alignItems: 'center',
  },
  brandTitle: {
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  brandTitleLarge: {
    fontSize: 32,
  },
  brandTitleSmall: {
    fontSize: 18,
  },
  brandAccent: {
    color: COLORS.primary,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
