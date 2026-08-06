import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useProfile } from '../../src/hooks/useProfile';
import { Logo } from '../../src/components/common/Logo';
import { RADIUS, SPACING } from '../../src/constants/theme';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: profileData, isLoading: loadingProfile } = useProfile();

  const staffName =
    profileData?.StaffName ||
    profileData?.EmployeeName ||
    user?.StaffName ||
    user?.rawResponse?.StaffName ||
    user?.User_Name ||
    'Employee';

  const staffCode =
    profileData?.StaffCode ||
    profileData?.EmployeeCode ||
    user?.StaffCode ||
    user?.User_Name ||
    'N/A';

  const gridCards = [
    {
      id: 'profile',
      title: 'Profile',
      subtitle: 'Employee info',
      icon: '👤',
      badge: 'Profile',
      badgeColor: '#0A57A8',
      route: '/(main)/profile',
      bgAccent: '#0A57A8' + '15',
    },
    {
      id: 'leave',
      title: 'Leave',
      subtitle: 'Apply & history',
      icon: '📝',
      badge: 'Leave',
      badgeColor: '#E31E24',
      route: '/(main)/leave',
      bgAccent: '#E31E24' + '15',
    },
    {
      id: 'claims',
      title: 'Claims',
      subtitle: 'Reimbursements',
      icon: '📋',
      badge: 'Claims',
      badgeColor: '#F59E0B',
      route: '/(main)/claims',
      bgAccent: '#FEF3C7',
    },
    {
      id: 'payslip',
      title: 'Payslip',
      subtitle: 'Salary slips',
      icon: '💰',
      badge: 'Payslip',
      badgeColor: '#0A57A8',
      route: '/(main)/payslip',
      bgAccent: '#0A57A8' + '15',
    },
  ];

  const fullWidthCard = {
    id: 'subsidy',
    title: 'Subsidy Wallet',
    subtitle: 'Check balance, scan merchant QR code & payment history',
    icon: '🪙',
    badge: 'QR Scanner',
    badgeColor: '#E31E24',
    route: '/(main)/subsidy',
    bgAccent: '#E31E24' + '15',
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A57A8" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Card with Corporate Blue Background */}
        <View style={styles.welcomeBanner}>
          <View style={styles.headerTopRow}>
            <Logo variant="header" />
            {loadingProfile ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <View style={styles.statusIndicator}>
                <View style={styles.redDot} />
                <Text style={styles.statusText}>Active Employee</Text>
              </View>
            )}
          </View>

          <View style={styles.welcomeInfoBox}>
            <Text style={styles.greetingText}>Welcome,</Text>
            <Text style={styles.userNameText}>{staffName}</Text>

            <View style={styles.codeRow}>
              <Text style={styles.codeLabel}>Employee Code:</Text>
              <Text style={styles.codeValue}>{staffCode}</Text>
            </View>
          </View>
        </View>

        {/* Section Title */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitleText}>Employee Self-Service</Text>
          <View style={styles.redTitleAccent} />
        </View>

        {/* 2-Column Responsive Grid with Exact Spec: MinHeight 150, Padding 16, Icon 36, Title 18, Desc 13 */}
        <View style={styles.gridContainer}>
          {gridCards.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.gridCardContainer}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardIconBox, { backgroundColor: item.bgAccent }]}>
                  <Text style={styles.cardIconText}>{item.icon}</Text>
                </View>
                <View style={[styles.badgePill, { backgroundColor: item.badgeColor + '18' }]}>
                  <Text style={[styles.badgePillText, { color: item.badgeColor }]}>
                    {item.badge}
                  </Text>
                </View>
              </View>

              <View style={styles.cardTextWrapper}>
                <Text style={styles.cardTitleText} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.cardSubtitleText} numberOfLines={2}>
                  {item.subtitle}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Card 5: Subsidy Wallet (Featured Full Width Card) */}
        <TouchableOpacity
          style={styles.fullCardContainer}
          onPress={() => router.push(fullWidthCard.route as any)}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardIconBox, { backgroundColor: fullWidthCard.bgAccent }]}>
              <Text style={styles.cardIconText}>{fullWidthCard.icon}</Text>
            </View>
            <View style={[styles.badgePill, { backgroundColor: fullWidthCard.badgeColor + '18' }]}>
              <Text style={[styles.badgePillText, { color: fullWidthCard.badgeColor }]}>
                {fullWidthCard.badge}
              </Text>
            </View>
          </View>

          <View style={styles.cardTextWrapper}>
            <Text style={styles.cardTitleText} numberOfLines={1}>
              {fullWidthCard.title}
            </Text>
            <Text style={styles.cardSubtitleText} numberOfLines={2}>
              {fullWidthCard.subtitle}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  welcomeBanner: {
    backgroundColor: '#0A57A8',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#073C74',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(227, 30, 36, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(227, 30, 36, 0.4)',
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E31E24',
    marginRight: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  welcomeInfoBox: {
    marginTop: 4,
  },
  greetingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userNameText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
    lineHeight: 28,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  codeLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '500',
    marginRight: 6,
  },
  codeValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: 0.2,
  },
  redTitleAccent: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E31E24',
    marginLeft: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  gridCardContainer: {
    width: '48.5%',
    minHeight: 150, // Minimum height 150 as requested
    padding: 16, // Padding 16 as requested
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg, // 16px Radius
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    justifyContent: 'space-between',
  },
  fullCardContainer: {
    width: '100%',
    minHeight: 140,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    marginTop: SPACING.xs,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconText: {
    fontSize: 26, // Icon visual representation size 36/26
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cardTextWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  cardTitleText: {
    fontSize: 18, // Title font size 18 as requested
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 2,
  },
  cardSubtitleText: {
    fontSize: 13, // Description font size 13 as requested
    color: '#6B7280',
    lineHeight: 18,
  },
});
