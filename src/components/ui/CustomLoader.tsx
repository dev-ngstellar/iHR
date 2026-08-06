import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

export interface CustomLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export const CustomLoader: React.FC<CustomLoaderProps> = React.memo(({
  message = 'Loading...',
  fullScreen = false,
}) => {
  if (fullScreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          {message ? <Text style={styles.loaderMessage}>{message}</Text> : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.inlineContainer}>
      <ActivityIndicator size="small" color={COLORS.primary} />
      {message ? <Text style={styles.inlineMessage}>{message}</Text> : null}
    </View>
  );
});

CustomLoader.displayName = 'CustomLoader';

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(248, 250, 252, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  loaderBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    minWidth: 160,
  },
  loaderMessage: {
    marginTop: SPACING.md,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  inlineMessage: {
    marginLeft: SPACING.sm,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
