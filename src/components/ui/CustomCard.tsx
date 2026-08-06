import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

export interface CustomCardProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'outlined' | 'flat';
}

export const CustomCard: React.FC<CustomCardProps> = React.memo(({
  children,
  title,
  subtitle,
  icon,
  badge,
  badgeColor = '#0A57A8',
  onPress,
  style,
  variant = 'default',
}) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: '#E5E7EB',
          elevation: 0,
          shadowOpacity: 0,
        };
      case 'flat':
        return {
          backgroundColor: COLORS.surfaceVariant,
          elevation: 0,
          shadowOpacity: 0,
        };
      case 'default':
      default:
        return {
          backgroundColor: '#FFFFFF',
          shadowColor: '#1F2937',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
          borderWidth: 1,
          borderColor: '#E5E7EB',
        };
    }
  };

  // Never use TouchableOpacity without an actual onPress handler – it intercepts touches and blocks child TextInputs
  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.card, getVariantStyle(), style]}
        onPress={onPress}
        activeOpacity={0.75}
      >
        {(title || icon || badge) && (
          <View style={styles.headerRow}>
            <View style={styles.titleLeft}>
              {icon && <View style={styles.iconWrapper}>{icon}</View>}
              <View style={styles.titleTextContainer}>
                {title && <Text style={styles.title}>{title}</Text>}
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
              </View>
            </View>
            {badge && (
              <View style={[styles.badge, { backgroundColor: badgeColor + '15' }]}>
                <Text style={[styles.badgeText, { color: badgeColor }]}>{badge}</Text>
              </View>
            )}
          </View>
        )}
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[styles.card, getVariantStyle(), style]}
    >
      {(title || icon || badge) && (
        <View style={styles.headerRow}>
          <View style={styles.titleLeft}>
            {icon && <View style={styles.iconWrapper}>{icon}</View>}
            <View style={styles.titleTextContainer}>
              {title && <Text style={styles.title}>{title}</Text>}
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          </View>
          {badge && (
            <View style={[styles.badge, { backgroundColor: badgeColor + '15' }]}>
              <Text style={[styles.badgeText, { color: badgeColor }]}>{badge}</Text>
            </View>
          )}
        </View>
      )}
      {children}
    </View>
  );
});

CustomCard.displayName = 'CustomCard';

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg, // 16px Radius as requested
    padding: SPACING.md,
    marginVertical: SPACING.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: '#0A57A8' + '12', // Subtle Blue icon background
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
