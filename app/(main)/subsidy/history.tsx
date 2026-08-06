import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useWalletHistory } from '../../../src/hooks/useSubsidy';
import { CustomCard } from '../../../src/components/ui/CustomCard';
import { CustomLoader } from '../../../src/components/ui/CustomLoader';
import { CustomEmptyState } from '../../../src/components/ui/CustomEmptyState';
import { CustomDatePicker } from '../../../src/components/ui/CustomDatePicker';
import { CustomToast } from '../../../src/components/ui/CustomToast';
import { RADIUS, SPACING } from '../../../src/constants/theme';
import { formatCurrency, formatDate } from '../../../src/utils/formatters';

export default function WalletHistoryScreen() {
  // Helper to format Today's date to YYYY-MM-DD
  const getTodayIso = (): string => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [selectedFilterDate, setSelectedFilterDate] = useState<string>(getTodayIso());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const {
    data: historyData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useWalletHistory(selectedFilterDate);

  const transactionList = useMemo(() => {
    return Array.isArray(historyData) ? historyData : [];
  }, [historyData]);

  // Calculate Header Summary Metrics (Total Transactions & Total Amount)
  const summaryMetrics = useMemo(() => {
    const totalCount = transactionList.length;
    const totalSum = transactionList.reduce((acc, item) => {
      const amt = parseFloat(item.Amount || item.Transaction_Amount || 0);
      return acc + (isNaN(amt) ? 0 : amt);
    }, 0);
    return { totalCount, totalSum };
  }, [transactionList]);

  const handleDateChange = (val: string) => {
    if (!val) {
      setToastMessage('Please select a date.');
      return;
    }
    setSelectedFilterDate(val);
  };

  // Helper to pick dynamic subsidy icon
  const getSubsidyIcon = (subsidyTypeName?: string) => {
    const name = String(subsidyTypeName || '').toLowerCase();
    if (name.includes('breakfast')) return '🧃';
    if (name.includes('lunch')) return '🍱';
    if (name.includes('dinner')) return '🍲';
    if (name.includes('drink') || name.includes('beverage')) return '🥤';
    return '🪙';
  };

  const renderItem = ({ item }: { item: any }) => {
    const subsidyTypeName = item.Subsidy_Type_Name || item.SubsidyType || 'Meal Subsidy';
    const subsidyIcon = getSubsidyIcon(subsidyTypeName);
    const amount = parseFloat(item.Amount || 0);
    const merchant = item.Remarks || item.Merchant_Name || item.Shop_Code || '—';
    const category = item.Category_Name || item.Category_Type || item.Category || '—';
    const txnDateFormatted = item.Transaction_Date ? formatDate(item.Transaction_Date) : 'N/A';
    const shopCode = item.Shop_Code || 'N/A';
    const txnId = item.Wallet_Transaction_ID || item.id || 'N/A';

    return (
      <View style={styles.cardWrapper}>
        <CustomCard style={styles.fintechCard}>
          {/* Top Row: Title with Icon & Large Amount */}
          <View style={styles.cardHeaderRow}>
            <View style={styles.titleRowLeft}>
              <Text style={styles.subsidyIcon}>{subsidyIcon}</Text>
              <Text style={styles.subsidyTitle}>{subsidyTypeName}</Text>
            </View>
            <Text style={styles.largeAmountText}>{formatCurrency(amount)}</Text>
          </View>

          {/* 2-Column Detail Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.gridRow}>
              <Text style={styles.blueLabel}>Merchant</Text>
              <Text style={styles.darkValue}>{merchant}</Text>
            </View>

            <View style={styles.gridRow}>
              <Text style={styles.blueLabel}>Category</Text>
              <Text style={styles.darkValue}>{category}</Text>
            </View>

            <View style={styles.gridRow}>
              <Text style={styles.blueLabel}>Transaction Date</Text>
              <Text style={styles.darkValue}>{txnDateFormatted}</Text>
            </View>

            <View style={styles.gridRow}>
              <Text style={styles.blueLabel}>Shop Code</Text>
              <Text style={styles.darkValue}>{shopCode}</Text>
            </View>

            <View style={[styles.gridRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.blueLabel}>Transaction ID</Text>
              <Text style={styles.darkValue}>#{txnId}</Text>
            </View>
          </View>
        </CustomCard>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A57A8" />
      <View style={styles.container}>
        <CustomToast
          visible={!!toastMessage}
          message={toastMessage || ''}
          type="error"
          onDismiss={() => setToastMessage(null)}
        />

        {/* Header Bar with Date Selector & Summary Metrics */}
        <View style={styles.headerBanner}>
          <View style={styles.datePickerContainer}>
            <CustomDatePicker
              label="Selected History Date *"
              value={selectedFilterDate}
              onChangeDate={handleDateChange}
              placeholder="Select Date"
              visible={showDatePicker}
              onOpen={() => setShowDatePicker(true)}
              onClose={() => setShowDatePicker(false)}
            />
          </View>

          <View style={styles.metricsSummaryCard}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Total Transactions</Text>
              <Text style={styles.metricValue}>{summaryMetrics.totalCount}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Total Amount</Text>
              <Text style={[styles.metricValue, { color: '#E31E24' }]}>
                {formatCurrency(summaryMetrics.totalSum)}
              </Text>
            </View>
          </View>
        </View>

        {isLoading && !isRefetching ? (
          <CustomLoader message="Loading Wallet Transactions..." fullScreen={false} />
        ) : isError ? (
          <CustomEmptyState
            title="Failed to Load Transactions"
            description="A network error occurred while fetching your transaction history."
            icon="⚠️"
            actionTitle="Retry Loading"
            onAction={refetch}
          />
        ) : (
          <FlatList
            data={transactionList}
            keyExtractor={(item, index) =>
              String(item.Wallet_Transaction_ID || item.id || index)
            }
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                colors={['#0A57A8']}
              />
            }
            ListEmptyComponent={
              <CustomEmptyState
                title="No Wallet Transactions Found"
                description={`No subsidy transactions recorded on ${formatDate(selectedFilterDate)}.`}
                icon="📜"
                actionTitle="Refresh List"
                onAction={refetch}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  container: {
    flex: 1,
  },
  headerBanner: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  datePickerContainer: {
    width: '100%',
    marginBottom: SPACING.xs,
  },
  metricsSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E5E7EB',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0A57A8',
    marginTop: 2,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  cardWrapper: {
    marginVertical: SPACING.xs,
  },
  fintechCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderLeftWidth: 5,
    borderLeftColor: '#0A57A8',
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  titleRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subsidyIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  subsidyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1F2937',
    flex: 1,
  },
  largeAmountText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1F2937',
  },
  detailsGrid: {
    width: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  blueLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0A57A8',
  },
  darkValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },
});
