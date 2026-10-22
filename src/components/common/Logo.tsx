import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
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
          <Image
            source={require('../../../assets/logo_new.jpg')}
            style={styles.headerLogoImage}
            resizeMode="contain"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.logoCard, isLarge ? styles.logoCardLarge : styles.logoCardSmall]}>
        <Image
          source={require('../../../assets/logo_new.jpg')}
          style={styles.logoImage}
          resizeMode="contain"
        />
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
  logoCard: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  logoCardLarge: {
    width: 96,
    height: 96,
    borderRadius: 24,
    padding: 10,
    marginBottom: 16,
  },
  logoCardSmall: {
    width: 44,
    height: 44,
    borderRadius: 12,
    padding: 4,
    marginBottom: 6,
  },
  logoImage: {
    width: '100%',
    height: '100%',
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerLogoImage: {
    width: 38,
    height: 22,
  },
});
