import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CustomCard } from '../../../src/components/ui/CustomCard';
import { CustomLoader } from '../../../src/components/ui/CustomLoader';
import { CustomEmptyState } from '../../../src/components/ui/CustomEmptyState';
import { useLeaveHistory } from '../../../src/hooks/useLeave';
import { RADIUS, SPACING } from '../../../src/constants/theme';

export default function LeaveDashboardScreen() {
  const router = useRouter();
  const { data: historyList, isLoading, isError, refetch, isRefetching } = useLeaveHistory();

  if (isLoading && !isRefetching) {
    return <CustomLoader message="Loading Leave Dashboard..." fullScreen={true} />;
  }

  if (isError && !historyList) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0A57A8" />
        <CustomEmptyState
          title="Failed to Load Dashboard"
          description="A network error occurred while fetching your leave details."
          icon="⚠️"
          actionTitle="Retry Loading"
          onAction={refetch}
        />
      </SafeAreaView>
    );
  }

  const dataArray = Array.isArray(historyList) ? historyList : [];

  const totalApplications = dataArray.length;
  const pendingCount = dataArray.filter((item: any) =>
    String(item.LeaveStatus || item.Status || item.status || '').toLowerCase().includes('pending')
  ).length;
  const approvedCount = dataArray.filter((item: any) => {
    const s = String(item.LeaveStatus || item.Status || item.status || '').toLowerCase();
    return s.includes('approved') || s.includes('confirm');
  }).length;
  const rejectedCount = dataArray.filter((item: any) =>
    String(item.LeaveStatus || item.Status || item.status || '').toLowerCase().includes('reject')
  ).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A57A8" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={['#0A57A8']}
          />
        }
      >
        {/* Banner Summary */}
        <View style={styles.summaryBanner}>
          <Text style={styles.bannerTitle}>Leave Overview</Text>
          <Text style={styles.bannerSubtitle}>
            Manage leave applications, check status & apply for time off
          </Text>

          <View style={styles.bannerMetricsGrid}>
            <View style={styles.bannerMetricCard}>
              <Text style={styles.metricNumber}>{totalApplications}</Text>
              <Text style={styles.metricLabel}>Total Applications</Text>
            </View>
            <View style={styles.bannerMetricCard}>
              <Text style={[styles.metricNumber, { color: '#F59E0B' }]}>{pendingCount}</Text>
              <Text style={styles.metricLabel}>Pending</Text>
            </View>
            <View style={styles.bannerMetricCard}>
              <Text style={[styles.metricNumber, { color: '#16A34A' }]}>{approvedCount}</Text>
              <Text style={styles.metricLabel}>Approved</Text>
            </View>
            <View style={styles.bannerMetricCard}>
              <Text style={[styles.metricNumber, { color: '#DC2626' }]}>{rejectedCount}</Text>
              <Text style={styles.metricLabel}>Rejected</Text>
            </View>
          </View>
        </View>

        {/* 2 Main Navigation Cards */}
        <Text style={styles.sectionTitle}>Leave Navigation</Text>

        {/* Card 1: Leave History */}
        <CustomCard
          title="Leave History"
          subtitle="View all submitted leave applications, date ranges & approval status badges"
          badge="View History"
          badgeColor="#0A57A8"
          onPress={() => router.push('/(main)/leave/history' as any)}
          style={styles.navCard}
          icon={
            <View style={[styles.iconBox, { backgroundColor: '#0A57A8' + '15' }]}>
              <Ionicons name="time-outline" size={24} color="#0A57A8" />
            </View>
          }
        />

        {/* Card 2: Apply Leave */}
        <CustomCard
          title="Apply Leave"
          subtitle="Submit a new leave application request with emergency contacts & reason"
          badge="New Application"
          badgeColor="#E31E24"
          onPress={() => router.push('/(main)/leave/apply' as any)}
          style={styles.navCard}
          icon={
            <View style={[styles.iconBox, { backgroundColor: '#E31E24' + '15' }]}>
              <Ionicons name="add-circle-outline" size={24} color="#E31E24" />
            </View>
          }
        />
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
  summaryBanner: {
    backgroundColor: '#0A57A8',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#073C74',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  bannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  bannerMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    justifyContent: 'space-between',
  },
  bannerMetricCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  metricNumber: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  metricLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: SPACING.sm,
  },
  navCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 24,
  },
});
