import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useWalletBalance } from '../../../src/hooks/useSubsidy';
import { CustomButton } from '../../../src/components/ui/CustomButton';
import { CustomLoader } from '../../../src/components/ui/CustomLoader';
import { CustomEmptyState } from '../../../src/components/ui/CustomEmptyState';
import { RADIUS, SPACING } from '../../../src/constants/theme';
import { formatCurrency } from '../../../src/utils/formatters';

export default function SubsidyScreen() {
  const router = useRouter();
  const { data: balanceData, isLoading, isError, refetch, isRefetching } = useWalletBalance();

  if (isLoading && !isRefetching) {
    return <CustomLoader message="Loading Subsidy Balance..." fullScreen={true} />;
  }

  if (isError && !balanceData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <CustomEmptyState
          title="Failed to Load Subsidy Balance"
          description="A network error occurred while fetching your subsidy balance."
          icon="⚠️"
          actionTitle="Retry Loading"
          onAction={refetch}
        />
      </SafeAreaView>
    );
  }

  const currentBalance = balanceData?.balance ?? 0;
  const lastUpdated = balanceData?.lastUpdatedDate || 'N/A';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A57A8" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Wallet Balance Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.badgeRow}>
              <Text style={styles.walletIcon}>🪙</Text>
              <Text style={styles.walletBadgeText}>SUBSIDY BALANCE</Text>
            </View>
            <TouchableOpacity style={styles.syncBtn} onPress={() => refetch()}>
              <Text style={styles.syncText}>↻ Sync</Text>
            </TouchableOpacity>
          </View>

          {/* Large White Balance Text */}
          <Text style={styles.balanceText}>{formatCurrency(currentBalance)}</Text>

          {/* Small White Date Text */}
          <View style={styles.heroFooter}>
            <Text style={styles.updatedDateText}>Updated: {lastUpdated}</Text>
          </View>
        </View>

        {/* Vertical Action Stack */}
        <View style={styles.verticalActionContainer}>
          {/* 2. Scan QR Button */}
          <CustomButton
            title="📷 Scan Merchant QR Code"
            onPress={() => router.push('/(main)/subsidy/scanner' as any)}
            size="large"
            style={styles.scanBtn}
          />

          {/* 3. Wallet History Button */}
          <CustomButton
            title="📜 View Wallet History"
            onPress={() => router.push('/(main)/subsidy/history' as any)}
            variant="outline"
            size="large"
            style={styles.historyBtn}
          />
        </View>
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
    flexGrow: 1,
    justifyContent: 'center',
  },
  heroCard: {
    backgroundColor: '#0A57A8', // Official Infoline Primary Blue
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    shadowColor: '#073C74',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIcon: {
    fontSize: 22,
    marginRight: 6,
  },
  walletBadgeText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  syncBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  syncText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  balanceText: {
    color: '#FFFFFF', // Large White Balance Text
    fontSize: 40,
    fontWeight: '900',
    marginVertical: SPACING.md,
  },
  heroFooter: {
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  updatedDateText: {
    color: 'rgba(255, 255, 255, 0.85)', // Small White Updated Date Text
    fontSize: 13,
    fontWeight: '500',
  },
  verticalActionContainer: {
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  scanBtn: {
    width: '100%',
    backgroundColor: '#0A57A8', // Infoline Primary Blue Button
  },
  historyBtn: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderColor: '#0A57A8',
  },
});
