import React, { useCallback } from 'react';
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { CustomHeader } from '../../src/components/ui/CustomHeader';
import { Logo } from '../../src/components/common/Logo';
import { useAuth } from '../../src/context/AuthContext';

// Statically memoized header elements to prevent any remounts or visual flash
const DashboardLogo = React.memo(() => <Logo variant="header" />);
DashboardLogo.displayName = 'DashboardLogo';

const DashboardLogoutButton = React.memo(({ onLogout }: { onLogout: () => void }) => (
  <TouchableOpacity
    style={styles.logoutBtn}
    onPress={onLogout}
    activeOpacity={0.7}
    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
  >
    <Text style={styles.logoutText}>Logout</Text>
  </TouchableOpacity>
));
DashboardLogoutButton.displayName = 'DashboardLogoutButton';

interface HeaderComponentProps {
  options: any;
  route: any;
  back?: any;
}

const HeaderComponent = React.memo(({ options, route, back }: HeaderComponentProps) => {
  const isDashboard = route.name === 'dashboard';
  const showBackButton = options.headerBackVisible !== false && !isDashboard && !!back;
  const title = options.headerTitle || options.title || 'iHR';

  const leftElement = options.headerLeft
    ? options.headerLeft()
    : showBackButton
    ? null
    : <Logo variant="header" />;

  const rightElement = options.headerRight ? options.headerRight() : null;

  return (
    <CustomHeader
      title={typeof title === 'string' ? title : 'Dashboard'}
      showBackButton={showBackButton}
      leftAction={leftElement}
      rightAction={rightElement}
    />
  );
});

HeaderComponent.displayName = 'HeaderComponent';

export default function MainLayout() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Logout Confirmation',
      'Are you sure you want to log out from iHR Wallet?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  }, [logout, router]);

  const renderDashboardLeft = useCallback(() => <DashboardLogo />, []);
  const renderDashboardRight = useCallback(() => <DashboardLogoutButton onLogout={handleLogout} />, [handleLogout]);
  const renderHeader = useCallback((props: any) => <HeaderComponent {...props} />, []);

  return (
    <Stack screenOptions={{ header: renderHeader }}>
      <Stack.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          headerTitle: 'Dashboard',
          headerBackVisible: false,
          headerLeft: renderDashboardLeft,
          headerRight: renderDashboardRight,
        }}
      />
      <Stack.Screen name="profile" options={{ title: 'Employee Profile' }} />
      <Stack.Screen name="leave/index" options={{ title: 'Leave Dashboard' }} />
      <Stack.Screen name="leave/history" options={{ title: 'Leave History' }} />
      <Stack.Screen name="leave/apply" options={{ title: 'Apply Leave' }} />
      <Stack.Screen name="claims/index" options={{ title: 'Claims' }} />
      <Stack.Screen name="payslip/index" options={{ title: 'Payslip' }} />
      <Stack.Screen name="subsidy/index" options={{ title: 'Subsidy Wallet' }} />
      <Stack.Screen name="subsidy/scanner" options={{ headerShown: false }} />
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
