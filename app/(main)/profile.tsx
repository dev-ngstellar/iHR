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
import { useProfile } from '../../src/hooks/useProfile';
import { CustomCard } from '../../src/components/ui/CustomCard';
import { CustomLoader } from '../../src/components/ui/CustomLoader';
import { CustomEmptyState } from '../../src/components/ui/CustomEmptyState';
import { RADIUS, SPACING } from '../../src/constants/theme';
import { formatDate } from '../../src/utils/formatters';

export default function ProfileScreen() {
  const { data: profileData, isLoading, isError, refetch, isRefetching } = useProfile();

  if (isLoading && !isRefetching) {
    return <CustomLoader message="Loading Employee Profile..." fullScreen={true} />;
  }

  if (isError && !profileData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0A57A8" />
        <CustomEmptyState
          title="Failed to Load Profile"
          description="A network error occurred while fetching your employee profile."
          icon="⚠️"
          actionTitle="Retry Loading"
          onAction={refetch}
        />
      </SafeAreaView>
    );
  }

  const raw = profileData || {};

  // Exact API field mapping as per requirements
  const empName = raw.StaffName || raw.EmployeeName || raw.Name || '';
  const empCode = raw.StaffCode || raw.EmployeeCode || '';
  const icNo = raw.ICNo || raw.IC_Passport || raw.ICNumber || '';
  const dobRaw = raw.DOB || raw.DateOfBirth;
  const dobStr = dobRaw ? formatDate(dobRaw) : '';
  const dept = raw.Dept || raw.Department || '';
  const grade = raw.Grade || '';
  const reportTo = raw.ReportTo || raw.ReportingManager || '';
  const addressRaw = raw.Address || raw.ResidentialAddress;
  const address = addressRaw ? String(addressRaw).trim() : 'Not Available';

  const profileRows = [
    { label: 'Employee Name', value: empName || 'N/A' },
    { label: 'Employee Code', value: empCode || 'N/A' },
    { label: 'IC Number', value: icNo || 'N/A' },
    { label: 'Date Of Birth', value: dobStr || 'N/A' },
    { label: 'Department', value: dept || 'N/A' },
    { label: 'Grade', value: grade || 'N/A' },
    { label: 'Reporting To', value: reportTo || 'N/A' },
    { label: 'Address', value: address },
  ];

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
        {/* Employee Header Badge */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{(empName || 'E').charAt(0)}</Text>
          </View>
          <Text style={styles.profileName}>{empName || 'Employee Profile'}</Text>
          <Text style={styles.profileTitle}>{dept || 'Staff Member'}</Text>
          {empCode ? (
            <View style={styles.idBadge}>
              <Text style={styles.idBadgeText}>EMPLOYEE CODE #{empCode}</Text>
            </View>
          ) : null}
        </View>

        {/* Profile Information Card with Blue Section Header & Red Accent */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Employee Information</Text>
          <View style={styles.redDividerAccent} />
        </View>

        <CustomCard style={styles.profileCard}>
          <View style={styles.fieldsContainer}>
            {profileRows.map((item, idx) => (
              <View
                key={idx}
                style={[
                  styles.fieldRow,
                  idx === profileRows.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <Text style={styles.fieldLabel}>{item.label}</Text>
                <Text style={styles.fieldValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </CustomCard>
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
  avatarCard: {
    backgroundColor: '#0A57A8',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    shadowColor: '#073C74',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 3,
    borderColor: '#E31E24',
  },
  avatarText: {
    color: '#0A57A8',
    fontSize: 30,
    fontWeight: '900',
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  profileTitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  idBadge: {
    marginTop: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  idBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0A57A8',
    letterSpacing: 0.2,
  },
  redDividerAccent: {
    flex: 1,
    height: 2,
    backgroundColor: '#E31E24',
    marginLeft: 12,
    borderRadius: 1,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  fieldsContainer: {
    width: '100%',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  fieldLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    flex: 1,
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1.3,
    textAlign: 'right',
  },
});
