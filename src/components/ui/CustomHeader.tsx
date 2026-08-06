import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Logo } from '../common/Logo';
import { SPACING } from '../../constants/theme';

export interface CustomHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
}

export const CustomHeader: React.FC<CustomHeaderProps> = React.memo(({
  title,
  showBackButton = false,
  onBackPress,
  rightAction,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(main)/dashboard' as any);
    }
  };

  return (
    <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0A57A8" />
      <View style={styles.headerBar}>
        <View style={styles.leftSection}>
          {showBackButton ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.backArrow}>←</Text>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <Logo variant="header" />
          )}
        </View>

        <View style={styles.centerSection}>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <View style={styles.rightSection}>{rightAction}</View>
      </View>
    </View>
  );
});

CustomHeader.displayName = 'CustomHeader';

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: '#0A57A8',
  },
  headerBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    backgroundColor: '#0A57A8',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingRight: 8,
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    marginRight: 4,
    fontWeight: '600',
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
