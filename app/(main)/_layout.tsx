import React, { useCallback } from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { CustomHeader } from '../../src/components/ui/CustomHeader';
import { useAuth } from '../../src/context/AuthContext';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const HeaderComponent = React.memo(({ options }: { options: any }) => {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = useCallback(async () => {
    await logout();
    router.replace('/(auth)/login');
  }, [logout, router]);

  const getScreenTitle = (path: string): string => {
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/profile')) return 'Employee Profile';
    if (path.includes('/leave/apply')) return 'Apply Leave';
    if (path.includes('/leave/history')) return 'Leave History';
    if (path.includes('/leave')) return 'Leave Dashboard';
    if (path.includes('/claims')) return 'Claims Management';
    if (path.includes('/payslip')) return 'Payslip Overview';
    if (path.includes('/subsidy/scanner')) return 'QR Scanner';
    if (path.includes('/subsidy/confirm-payment')) return 'Confirm Payment';
    if (path.includes('/subsidy/history')) return 'Subsidy History';
    if (path.includes('/subsidy')) return 'Subsidy Wallet';
    return 'iHR';
  };

  const isDashboard = pathname.includes('/dashboard');
  const title = options.title || getScreenTitle(pathname);

  return (
    <CustomHeader
      title={title}
      showBackButton={!isDashboard}
      rightAction={
        isDashboard ? (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        ) : null
      }
    />
  );
});

HeaderComponent.displayName = 'HeaderComponent';

export default function MainLayout() {
  const renderHeader = useCallback((props: any) => <HeaderComponent {...props} />, []);

  return (
    <Stack screenOptions={{ header: renderHeader }}>
      <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Stack.Screen name="profile" options={{ title: 'Employee Profile' }} />
      <Stack.Screen name="leave/index" options={{ title: 'Leave Dashboard' }} />
      <Stack.Screen name="leave/history" options={{ title: 'Leave History' }} />
      <Stack.Screen name="leave/apply" options={{ title: 'Apply Leave' }} />
      <Stack.Screen name="claims/index" options={{ title: 'Claims' }} />
      <Stack.Screen name="payslip/index" options={{ title: 'Payslip' }} />
      <Stack.Screen name="subsidy/index" options={{ title: 'Subsidy Wallet' }} />
      <Stack.Screen name="subsidy/scanner" options={{ title: 'QR Scanner' }} />
      <Stack.Screen name="subsidy/confirm-payment" options={{ title: 'Confirm Payment' }} />
      <Stack.Screen name="subsidy/history" options={{ title: 'Subsidy History' }} />
      <Stack.Screen name="keyboard-test" options={{ title: 'Keyboard Test' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f41717ff',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
