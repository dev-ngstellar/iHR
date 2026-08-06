import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

export interface CustomToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onDismiss?: () => void;
}

export const CustomToast: React.FC<CustomToastProps> = React.memo(({
  visible,
  message,
  type = 'info',
  onDismiss,
}) => {
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return COLORS.accent;
      case 'error':
        return COLORS.danger;
      case 'info':
      default:
        return COLORS.primary;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  // When not visible, render nothing at all – do NOT keep an invisible
  // absolutely-positioned, high-elevation View in the tree as it will block
  // all touch events below it on Android.
  if (!visible) return null;

  return (
    <View
      style={[styles.container, { backgroundColor: getBackgroundColor() }]}
      // pointerEvents="box-none" ensures it doesn't block taps on siblings below
      pointerEvents="box-none"
    >
      <Text style={styles.icon}>{getIcon()}</Text>
      <Text style={styles.message}>{message}</Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

CustomToast.displayName = 'CustomToast';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: SPACING.md,
    right: SPACING.md,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
  icon: {
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 10,
    fontWeight: '800',
  },
  message: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 8,
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
