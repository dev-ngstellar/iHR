import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CustomButton } from './CustomButton';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

export interface CustomEmptyStateProps {
  title?: string;
  description?: string;
  icon?: string;
  actionTitle?: string;
  onAction?: () => void;
}

export const CustomEmptyState: React.FC<CustomEmptyStateProps> = React.memo(({
  title = 'No Records Found',
  description = 'There are currently no items or details to display in this list.',
  icon = '📋',
  actionTitle,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionTitle && onAction && (
        <CustomButton
          title={actionTitle}
          onPress={onAction}
          variant="outline"
          size="small"
          style={styles.actionButton}
        />
      )}
    </View>
  );
});

CustomEmptyState.displayName = 'CustomEmptyState';

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  actionButton: {
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.lg,
  },
});
