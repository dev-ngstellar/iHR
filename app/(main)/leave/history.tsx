import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useLeaveHistory } from '../../../src/hooks/useLeave';
import { CustomCard } from '../../../src/components/ui/CustomCard';
import { CustomLoader } from '../../../src/components/ui/CustomLoader';
import { CustomEmptyState } from '../../../src/components/ui/CustomEmptyState';
import { COLORS, RADIUS, SPACING } from '../../../src/constants/theme';
import { formatDate } from '../../../src/utils/formatters';

export default function LeaveHistoryScreen() {
  const { data: historyList, isLoading, isError, refetch, isRefetching } = useLeaveHistory();

  if (isLoading && !isRefetching) {
    return <CustomLoader message="Loading Leave Applications..." fullScreen={true} />;
  }

  if (isError && (!historyList || (Array.isArray(historyList) && historyList.length === 0))) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <CustomEmptyState
          title="Failed to Load Leave History"
          description="A network error occurred while fetching your leave applications."
          icon="⚠️"
          actionTitle="Retry Loading"
          onAction={refetch}
        />
      </SafeAreaView>
    );
  }

  const dataArray = Array.isArray(historyList) ? historyList : [];

  const getStatusBadge = (statusStr?: string) => {
    const status = String(statusStr || 'Confirmed').toLowerCase();
    if (status.includes('approved') || status.includes('confirmed')) {
      return { label: 'Confirmed', bg: COLORS.statusApprovedBg, text: COLORS.statusApprovedText };
    }
    if (status.includes('reject')) {
      return { label: 'Rejected', bg: COLORS.statusRejectedBg, text: COLORS.statusRejectedText };
    }
    return { label: 'Pending', bg: COLORS.statusPendingBg, text: COLORS.statusPendingText };
  };

  const renderItem = ({ item }: { item: any }) => {
    const leaveType = item.LeaveTypeName || item.LeaveType || item.leaveType || 'Leave';
    const referenceNo = item.ReferenceNo || item.referenceNo || 'N/A';
    const reason = item.Reason || item.reason || 'N/A';
    const fromDate = item.FromDate || item.fromDate ? formatDate(item.FromDate || item.fromDate) : 'N/A';
    const toDate = item.ToDate || item.toDate ? formatDate(item.ToDate || item.toDate) : 'N/A';
    const statusBadge = getStatusBadge(item.LeaveStatus || item.Status || item.status);

    return (
      <CustomCard style={styles.historyCard}>
        <View style={styles.cardHeader}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{leaveType}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
            <Text style={[styles.statusText, { color: statusBadge.text }]}>
              {statusBadge.label}
            </Text>
          </View>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reference:</Text>
            <Text style={styles.detailValue}>{referenceNo}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reason:</Text>
            <Text style={styles.detailValue}>{reason}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>From:</Text>
            <Text style={styles.detailValue}>{fromDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>To:</Text>
            <Text style={styles.detailValue}>{toDate}</Text>
          </View>
        </View>
      </CustomCard>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A57A8" />
      <FlatList
        data={dataArray}
        keyExtractor={(item, index) => String(item.id || item.ReferenceNo || item.LeaveID || index)}
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
            title="No Leave Applications Found"
            description="You currently have no leave application records."
            icon="📝"
            actionTitle="Refresh List"
            onAction={refetch}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  historyCard: {
    marginVertical: SPACING.xs,
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  typeBadge: {
    backgroundColor: '#0A57A8' + '15',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  typeText: {
    color: '#0A57A8',
    fontSize: 15,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailsGrid: {
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
});
