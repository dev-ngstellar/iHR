import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
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

  // Safely extract the data array whether it's directly an array or wrapped in an envelope
  const rawList = Array.isArray(historyList)
    ? historyList
    : (historyList as any)?.Data ||
      (historyList as any)?.data ||
      (historyList as any)?.LeaveApplications ||
      (historyList as any)?.result ||
      [];

  // Filter to valid leave application items (must be an object and not an empty wrapper)
  const dataArray: any[] = Array.isArray(rawList)
    ? rawList.filter((item: any) => {
        if (!item || typeof item !== 'object') return false;
        const hasLeaveField =
          item.Leave_Application_ID !== undefined ||
          item.LeaveApplicationID !== undefined ||
          item.LeaveID !== undefined ||
          item.Leave_ID !== undefined ||
          item.ApplicationID !== undefined ||
          item.LeaveTypeName !== undefined ||
          item.LeaveType !== undefined ||
          item.leaveType !== undefined ||
          item.FromDate !== undefined ||
          item.fromDate !== undefined ||
          item.Reason !== undefined ||
          item.reason !== undefined ||
          item.ReferenceNo !== undefined ||
          item.referenceNo !== undefined;

        if (!hasLeaveField && ('Success' in item || 'success' in item)) {
          return false;
        }
        return true;
      })
    : [];

  if (isError && dataArray.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <CustomEmptyState
          title="Failed to Load Leave History"
          description="A network error occurred while fetching your leave applications."
          icon="⚠️"
          actionTitle="Retry Loading"
          onAction={() => {
            void refetch();
          }}
        />
      </SafeAreaView>
    );
  }

  const safeString = (val: any, fallback = 'N/A'): string => {
    if (val === null || val === undefined || val === '') return fallback;
    if (typeof val === 'object') {
      if (typeof val.LeaveTypeName === 'string') return val.LeaveTypeName;
      if (typeof val.LeaveType === 'string') return val.LeaveType;
      if (typeof val.name === 'string') return val.name;
      if (typeof val.label === 'string') return val.label;
      if (typeof val.value === 'string' || typeof val.value === 'number') return String(val.value);
      return fallback;
    }
    return String(val);
  };

  const getStatusBadge = (statusVal?: any) => {
    const rawStatus = safeString(statusVal, 'Confirmed');
    const status = rawStatus.toLowerCase();
    if (status.includes('approved') || status.includes('confirmed')) {
      return { label: 'Confirmed', bg: COLORS.statusApprovedBg, text: COLORS.statusApprovedText };
    }
    if (status.includes('reject')) {
      return { label: 'Rejected', bg: COLORS.statusRejectedBg, text: COLORS.statusRejectedText };
    }
    return { label: 'Pending', bg: COLORS.statusPendingBg, text: COLORS.statusPendingText };
  };

  const getItemKey = (item: any, index: number): string => {
    if (!item || typeof item !== 'object') {
      return `leave-item-${index}`;
    }
    const rawId =
      item.Leave_Application_ID ??
      item.LeaveApplicationID ??
      item.ApplicationID ??
      item.Application_ID ??
      item.LeaveID ??
      item.Leave_ID ??
      item.id ??
      item.ID ??
      item.ReferenceNo ??
      item.referenceNo ??
      item.RefNo ??
      item.Reference_No;

    if (rawId !== undefined && rawId !== null && String(rawId).trim() !== '' && String(rawId).trim() !== 'N/A') {
      return `leave-${String(rawId)}-${index}`;
    }
    return `leave-item-${index}`;
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const rawType =
      item.LeaveTypeName ??
      item.LeaveType ??
      item.leaveType ??
      item.Leave_Type_Name ??
      item.Leave_Type;
    const leaveType = safeString(rawType, 'Leave');

    const rawRef =
      item.ReferenceNo ??
      item.referenceNo ??
      item.RefNo ??
      item.Reference_No ??
      item.Leave_Application_ID ??
      item.LeaveApplicationID;
    const referenceNo = safeString(rawRef, 'N/A');

    const rawReason = item.Reason ?? item.reason ?? item.Remarks ?? item.remarks;
    const reason = safeString(rawReason, 'N/A');

    const rawFrom =
      item.FromDate ??
      item.fromDate ??
      item.From_Date ??
      item.LeaveDate ??
      item.leaveDate;
    const fromDate =
      typeof rawFrom === 'string' && rawFrom.trim() !== ''
        ? formatDate(rawFrom)
        : safeString(rawFrom, 'N/A');

    const rawTo =
      item.ToDate ??
      item.toDate ??
      item.To_Date ??
      rawFrom;
    const toDate =
      typeof rawTo === 'string' && rawTo.trim() !== ''
        ? formatDate(rawTo)
        : safeString(rawTo, 'N/A');

    const rawStatus =
      item.LeaveStatus ??
      item.Status ??
      item.status ??
      item.ApprovalStatus ??
      item.Leave_Status;
    const statusBadge = getStatusBadge(rawStatus);

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
      <StatusBar style="light" />
      <FlatList
        data={dataArray}
        keyExtractor={getItemKey}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              void refetch();
            }}
            colors={['#0A57A8']}
          />
        }
        ListEmptyComponent={
          <CustomEmptyState
            title="No Leave Applications Found"
            description="You currently have no leave application records."
            icon="📝"
            actionTitle="Refresh List"
            onAction={() => {
              void refetch();
            }}
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
