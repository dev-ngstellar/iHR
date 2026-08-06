import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { CustomLoader } from '../src/components/ui/CustomLoader';
import { Logo } from '../src/components/common/Logo';
import { COLORS } from '../src/constants/theme';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(main)/dashboard' as any);
      } else {
        router.replace('/(auth)/login' as any);
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <View style={styles.container}>
      <Logo variant="large" showSubtitle={false} />
      <View style={styles.loaderWrapper}>
        <CustomLoader message="Initializing iHR ..." />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderWrapper: {
    marginTop: 32,
  },
});
