import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApplyLeave, useLeaveTypes } from '../../../src/hooks/useLeave';
import { CustomCard } from '../../../src/components/ui/CustomCard';
import { CustomButton } from '../../../src/components/ui/CustomButton';
import { CustomInput } from '../../../src/components/ui/CustomInput';
import { CustomSelect, SelectOption } from '../../../src/components/ui/CustomSelect';
import { CustomDatePicker } from '../../../src/components/ui/CustomDatePicker';
import { CustomToast } from '../../../src/components/ui/CustomToast';
import { RADIUS, SPACING } from '../../../src/constants/theme';

export default function ApplyLeaveScreen() {
  const router = useRouter();
  const applyLeaveMutation = useApplyLeave();
  const { data: rawLeaveTypes, isLoading: loadingTypes } = useLeaveTypes();

  // Helper to format Date to YYYY-MM-DD
  const getTodayIso = (): string => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayIso = getTodayIso();
  const todayDateObj = new Date();

  // Form State - Starts empty except Leave Application Date (Today)
  const [leaveTypeId, setLeaveTypeId] = useState<string | number>('');
  const [leaveDate, setLeaveDate] = useState<string>(todayIso);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [emergencyNo, setEmergencyNo] = useState<string>('');
  const [emergencyAddress, setEmergencyAddress] = useState<string>('');

  // Maintain 3 Independent Picker Modal Visibility States
  const [showLeaveDatePicker, setShowLeaveDatePicker] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  // Form Validation Errors & Toast State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'error' | 'success'>('error');

  // Populate Leave Types Dropdown dynamically from API
  const leaveTypeOptions: SelectOption[] = useMemo(() => {
    if (!rawLeaveTypes || !Array.isArray(rawLeaveTypes)) return [];
    return rawLeaveTypes.map((item: any) => ({
      label: item.LeaveTypeName || item.LeaveType || item.leaveTypeName || `Type #${item.LeaveTypeID}`,
      value: item.LeaveTypeID || item.leaveTypeID || item.id,
    }));
  }, [rawLeaveTypes]);

  // Open single picker at a time & dismiss keyboard
  const openLeaveDatePicker = () => {
    Keyboard.dismiss();
    setShowFromDatePicker(false);
    setShowToDatePicker(false);
    setShowLeaveDatePicker(true);
  };

  const openFromDatePicker = () => {
    Keyboard.dismiss();
    setShowLeaveDatePicker(false);
    setShowToDatePicker(false);
    setShowFromDatePicker(true);
  };

  const openToDatePicker = () => {
    Keyboard.dismiss();
    setShowLeaveDatePicker(false);
    setShowFromDatePicker(false);
    setShowToDatePicker(true);
  };

  // Handle FromDate Change & Automatically Update Minimum Date for ToDate
  const handleFromDateChange = (selectedFrom: string) => {
    setFromDate(selectedFrom);
    if (errors.fromDate) {
      setErrors((prev) => ({ ...prev, fromDate: '' }));
    }
    // If toDate is before selectedFrom, reset toDate to selectedFrom
    if (toDate && toDate < selectedFrom) {
      setToDate(selectedFrom);
    }
  };

  // Helper to parse YYYY-MM-DD to Date object
  const parseDateStr = (str?: string): Date => {
    if (!str) return todayDateObj;
    const parts = str.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return todayDateObj;
  };

  const minToDateObj = fromDate ? parseDateStr(fromDate) : todayDateObj;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!leaveTypeId) {
      newErrors.leaveTypeId = 'Please select a leave type';
    }
    if (!leaveDate) {
      newErrors.leaveDate = 'Leave Application Date is required';
    }
    if (!fromDate) {
      newErrors.fromDate = 'From Date is required';
    }
    if (!toDate) {
      newErrors.toDate = 'To Date is required';
    } else if (fromDate && toDate < fromDate) {
      newErrors.toDate = 'To Date cannot be before From Date';
    }
    if (!reason.trim()) {
      newErrors.reason = 'Reason is required';
    } else if (reason.trim().length < 3) {
      newErrors.reason = 'Reason must be at least 3 characters';
    }
    if (!emergencyNo.trim()) {
      newErrors.emergencyNo = 'Emergency Contact number is required';
    } else if (!/^\d{10,15}$/.test(emergencyNo.trim())) {
      newErrors.emergencyNo = 'Enter valid emergency contact (10-15 digits)';
    }
    if (!emergencyAddress.trim()) {
      newErrors.emergencyAddress = 'Emergency Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await applyLeaveMutation.mutateAsync({
        LeaveTypeID: Number(leaveTypeId),
        LeaveDate: leaveDate,
        FromDate: fromDate,
        ToDate: toDate,
        Reason: reason.trim(),
        EmergencyNo: emergencyNo.trim(),
        EmergencyAddress: emergencyAddress.trim(),
      });

      setToastType('success');
      setToastMessage('Leave Application Submitted Successfully');

      setTimeout(() => {
        router.replace('/(main)/leave/history' as any);
      }, 1200);
    } catch (error: any) {
      setToastType('error');
      setToastMessage(error.message || 'Failed to submit leave application. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A57A8" />
      {/* Toast must live at SafeAreaView level – NOT inside ScrollView. */}
      <CustomToast
        visible={!!toastMessage}
        message={toastMessage || ''}
        type={toastType}
        onDismiss={() => setToastMessage(null)}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Title Banner */}
          <View style={styles.topHeaderCard}>
            <Text style={styles.headerTitle}>Apply For Leave</Text>
            <Text style={styles.headerSubtitle}>
              Fill in your leave dates, reason, and emergency contact details
            </Text>
          </View>

          <CustomCard style={styles.formCard}>
            {/* 1. Leave Type Dropdown (Dynamically Loaded from GET /api/GetLeaveType) */}
            <CustomSelect
              label="Leave Type *"
              placeholder="Select Leave Type"
              options={leaveTypeOptions}
              selectedValue={leaveTypeId}
              onValueChange={(val) => {
                setLeaveTypeId(val);
                if (errors.leaveTypeId) setErrors((prev) => ({ ...prev, leaveTypeId: '' }));
              }}
              error={errors.leaveTypeId}
              loading={loadingTypes}
            />

            {/* 2. Leave Application Date Picker (Default Today, Min Today) */}
            <CustomDatePicker
              label="Leave Application Date *"
              value={leaveDate}
              onChangeDate={(val) => {
                setLeaveDate(val);
                if (errors.leaveDate) setErrors((prev) => ({ ...prev, leaveDate: '' }));
              }}
              minDate={todayDateObj}
              error={errors.leaveDate}
              visible={showLeaveDatePicker}
              onOpen={openLeaveDatePicker}
              onClose={() => setShowLeaveDatePicker(false)}
            />

            {/* 3. From Date Picker (Min Today) */}
            <CustomDatePicker
              label="From Date *"
              value={fromDate}
              onChangeDate={handleFromDateChange}
              minDate={todayDateObj}
              placeholder="Select From Date"
              error={errors.fromDate}
              visible={showFromDatePicker}
              onOpen={openFromDatePicker}
              onClose={() => setShowFromDatePicker(false)}
            />

            {/* 4. To Date Picker (Min = From Date) */}
            <CustomDatePicker
              label="To Date *"
              value={toDate}
              onChangeDate={(val) => {
                setToDate(val);
                if (errors.toDate) setErrors((prev) => ({ ...prev, toDate: '' }));
              }}
              minDate={minToDateObj}
              placeholder="Select To Date"
              error={errors.toDate}
              visible={showToDatePicker}
              onOpen={openToDatePicker}
              onClose={() => setShowToDatePicker(false)}
            />

            {/* 5. Reason Multiline TextArea with Max 500 Character Counter */}
            <View style={styles.textAreaWrapper}>
              <CustomInput
                label="Reason *"
                placeholder="Enter detailed reason for leave application..."
                value={reason}
                onChangeText={(text) => {
                  if (text.length <= 500) {
                    setReason(text);
                    if (errors.reason) setErrors((prev) => ({ ...prev, reason: '' }));
                  }
                }}
                multiline={true}
                numberOfLines={4}
                style={styles.textArea}
                error={errors.reason}
              />
              <Text style={styles.charCounter}>{reason.length} / 500</Text>
            </View>

            {/* 6. Emergency Contact (Numeric Keyboard, 10-15 digits) */}
            <CustomInput
              label="Emergency Contact Number *"
              placeholder="e.g. 0123456789"
              value={emergencyNo}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9]/g, '');
                setEmergencyNo(cleaned);
                if (errors.emergencyNo) setErrors((prev) => ({ ...prev, emergencyNo: '' }));
              }}
              keyboardType="number-pad"
              maxLength={15}
              error={errors.emergencyNo}
            />

            {/* 7. Emergency Address Multiline TextArea */}
            <CustomInput
              label="Emergency Address *"
              placeholder="Enter full emergency address during leave period..."
              value={emergencyAddress}
              onChangeText={(text) => {
                setEmergencyAddress(text);
                if (errors.emergencyAddress) setErrors((prev) => ({ ...prev, emergencyAddress: '' }));
              }}
              multiline={true}
              numberOfLines={3}
              style={styles.smallTextArea}
              error={errors.emergencyAddress}
            />

            {/* Submit & Cancel Buttons */}
            <CustomButton
              title="Submit Leave Application"
              onPress={handleSubmit}
              loading={applyLeaveMutation.isPending}
              disabled={applyLeaveMutation.isPending}
              size="large"
              style={styles.submitBtn}
            />
            <CustomButton
              title="Cancel"
              onPress={() => router.back()}
              variant="text"
              size="medium"
            />
          </CustomCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
    flexGrow: 1,
  },
  topHeaderCard: {
    backgroundColor: '#0A57A8',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#073C74',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    marginTop: 4,
  },
  formCard: {
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    backgroundColor: '#FFFFFF',
  },
  textAreaWrapper: {
    position: 'relative',
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  smallTextArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  charCounter: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: -8,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: SPACING.md,
    backgroundColor: '#0A57A8',
  },
});
