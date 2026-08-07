import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUpdateWallet, useWalletCategories } from '../../../src/hooks/useSubsidy';
import { CustomCard } from '../../../src/components/ui/CustomCard';
import { CustomButton } from '../../../src/components/ui/CustomButton';
import { CustomInput } from '../../../src/components/ui/CustomInput';
import { CustomSelect, SelectOption } from '../../../src/components/ui/CustomSelect';
import { CustomToast } from '../../../src/components/ui/CustomToast';
import { RADIUS, SPACING } from '../../../src/constants/theme';
import { formatCurrency } from '../../../src/utils/formatters';

export default function ConfirmPaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const updateWalletMutation = useUpdateWallet();
  const { data: rawCategories, isLoading: loadingCategories } = useWalletCategories();

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Parse merchant details from QR Scanner – ONLY from API response (no fake fallbacks)
  const shopDetails = useMemo(() => {
    if (params.shopDetailsJson && typeof params.shopDetailsJson === 'string') {
      try {
        const parsed = JSON.parse(params.shopDetailsJson);
        return {
          MMS_SHOP_CODE: String(parsed.MMS_SHOP_CODE || parsed.Shop_Code || parsed.ShopCode || ''),
          SHOP_DESCRIPTION: String(parsed.SHOP_DESCRIPTION || parsed.Merchant_Name || parsed.MerchantName || ''),
          Category: parsed.Category || null,
          Location: parsed.Location || null,
        };
      } catch {
        // fall through to empty object
      }
    }
    return {
      MMS_SHOP_CODE: '',
      SHOP_DESCRIPTION: '',
      Category: null,
      Location: null,
    };
  }, [params.shopDetailsJson]);

  // Form state – all empty by default, no pre-fills
  const [amountStr, setAmountStr] = useState('');
  const [remarks, setRemarks] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | number>('');

  // Dynamic Categories from POST /api/getAllWalletCategories
  const categoryOptions: SelectOption[] = useMemo(() => {
    if (!rawCategories || !Array.isArray(rawCategories)) return [];
    return rawCategories.map((c: any) => ({
      label: c.Category_Name || `Category ${c.Wallet_Category_ID}`,
      value: c.Wallet_Category_ID,
    }));
  }, [rawCategories]);

  // Derived validation
  const numericAmount = parseFloat(amountStr);
  const isAmountValid = !isNaN(numericAmount) && numericAmount > 0;
  const isCategorySelected = !!selectedCategoryId;
  const isFormValid = isAmountValid && isCategorySelected;

  const handleConfirmPayment = async () => {
    if (!isAmountValid) {
      setToastMessage('Please enter a valid payment amount.');
      return;
    }
    if (!isCategorySelected) {
      setToastMessage('Please select a Wallet Category.');
      return;
    }

    try {
      await updateWalletMutation.mutateAsync({
        Wallet_Transaction_ID: 0,
        Transaction_Date: new Date().toISOString().split('T')[0],
        Shop_Code: shopDetails.MMS_SHOP_CODE,
        Amount: numericAmount,
        Remarks: remarks.trim(),
        Wallet_Category_ID: Number(selectedCategoryId),
        Subsidy_Type_ID: 1,
      });

      setPaymentSuccess(true);
    } catch (err: any) {
      setToastMessage(err.message || 'Payment update failed. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A57A8" />
      {/* Toast at SafeAreaView root level to prevent scroll-area touch blocking */}
      <CustomToast
        visible={!!toastMessage}
        message={toastMessage || ''}
        type="error"
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
          {/* Read-Only Merchant Header Card (API values only) */}
          <CustomCard style={styles.merchantCard}>
            <View style={styles.shopBadge}>
              <Text style={styles.shopBadgeIcon}>🏬</Text>
            </View>
            <Text style={styles.verifiedText}>
              ✓ VERIFIED MERCHANT
              {shopDetails.MMS_SHOP_CODE ? ` (SHOP CODE #${shopDetails.MMS_SHOP_CODE})` : ''}
            </Text>
            <Text style={styles.shopName}>
              {shopDetails.SHOP_DESCRIPTION || '—'}
            </Text>
            {/* Only show Category/Location if API returned them */}
            {(shopDetails.Category || shopDetails.Location) ? (
              <Text style={styles.shopMeta}>
                {[shopDetails.Category, shopDetails.Location].filter(Boolean).join(' • ')}
              </Text>
            ) : null}
          </CustomCard>

          {/* Payment Entry Card */}
          <CustomCard style={styles.paymentCard}>
            <Text style={styles.cardHeading}>Payment Entry Details</Text>

            {/* 1. Amount – empty, numeric keyboard, required */}
            <CustomInput
              label="Payment Amount (MYR) *"
              placeholder="Enter payment amount"
              value={amountStr}
              onChangeText={(val) => {
                // Allow only digits and a single decimal point
                const cleaned = val.replace(/[^0-9.]/g, '');
                const parts = cleaned.split('.');
                const formatted = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned;
                setAmountStr(formatted);
              }}
              keyboardType="decimal-pad"
            />

            {/* 2. Wallet Category – dynamic from API */}
            <CustomSelect
              label="Wallet Category *"
              placeholder={loadingCategories ? 'Loading categories...' : 'Select Wallet Category'}
              options={categoryOptions}
              selectedValue={selectedCategoryId}
              onValueChange={setSelectedCategoryId}
              loading={loadingCategories}
            />

            {/* 3. Remarks – empty, optional */}
            <CustomInput
              label="Remarks"
              placeholder="Enter remarks (optional)"
              value={remarks}
              onChangeText={setRemarks}
            />

            {/* Summary Info Box */}
            {isAmountValid && (
              <View style={styles.subsidyInfoBox}>
                <Text style={styles.subsidyInfoText}>
                  💳 {formatCurrency(numericAmount)} will be deducted from your Subsidy Wallet balance.
                </Text>
              </View>
            )}

            {/* Confirm Button – disabled until form is valid */}
            <CustomButton
              title="Confirm & Deduct Subsidy"
              onPress={handleConfirmPayment}
              loading={updateWalletMutation.isPending}
              disabled={!isFormValid || updateWalletMutation.isPending}
              size="large"
              style={[styles.confirmBtn, (!isFormValid) && styles.confirmBtnDisabled]}
            />
            <CustomButton
              title="Cancel"
              onPress={() => router.replace('/(main)/subsidy' as any)}
              variant="text"
              size="small"
            />
          </CustomCard>

          {/* Payment Success Receipt Modal */}
          <Modal
            visible={paymentSuccess}
            transparent={true}
            animationType="slide"
            onRequestClose={() => {
              setPaymentSuccess(false);
              router.replace('/(main)/subsidy' as any);
            }}
          >
            <View style={styles.modalOverlay}>
              <CustomCard style={styles.successCard}>
                <View style={styles.successCircle}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
                <Text style={styles.successTitle}>Payment Successful!</Text>
                <Text style={styles.successSubtitle}>Subsidy balance updated</Text>

                <View style={styles.receiptBox}>
                  {shopDetails.SHOP_DESCRIPTION ? (
                    <View style={styles.receiptRow}>
                      <Text style={styles.receiptLabel}>Merchant</Text>
                      <Text style={styles.receiptValue}>{shopDetails.SHOP_DESCRIPTION}</Text>
                    </View>
                  ) : null}
                  {shopDetails.MMS_SHOP_CODE ? (
                    <View style={styles.receiptRow}>
                      <Text style={styles.receiptLabel}>Shop Code</Text>
                      <Text style={styles.receiptValue}>#{shopDetails.MMS_SHOP_CODE}</Text>
                    </View>
                  ) : null}
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Amount Paid</Text>
                    <Text style={styles.receiptValue}>{formatCurrency(numericAmount)}</Text>
                  </View>
                  {remarks ? (
                    <View style={styles.receiptRow}>
                      <Text style={styles.receiptLabel}>Remarks</Text>
                      <Text style={styles.receiptValue}>{remarks}</Text>
                    </View>
                  ) : null}
                </View>

                <CustomButton
                  title="Back to Wallet Home"
                  onPress={() => {
                    setPaymentSuccess(false);
                    router.replace('/(main)/subsidy' as any);
                  }}
                  size="large"
                  style={styles.doneBtn}
                />
              </CustomCard>
            </View>
          </Modal>
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
  merchantCard: {
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
  },
  shopBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0A57A8' + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  shopBadgeIcon: {
    fontSize: 32,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E31E24',
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: 'center',
  },
  shopName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
  },
  shopMeta: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  paymentCard: {
    padding: SPACING.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: SPACING.sm,
  },
  subsidyInfoBox: {
    backgroundColor: '#EFF6FF',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  subsidyInfoText: {
    fontSize: 13,
    color: '#1D4ED8',
    lineHeight: 18,
    fontWeight: '600',
  },
  confirmBtn: {
    marginTop: SPACING.sm,
    backgroundColor: '#0A57A8',
  },
  confirmBtnDisabled: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  successCard: {
    width: '100%',
    padding: SPACING.xl,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
  },
  successSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: SPACING.lg,
  },
  receiptBox: {
    width: '100%',
    backgroundColor: '#F7F9FC',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  receiptLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  receiptValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  doneBtn: {
    width: '100%',
    backgroundColor: '#0A57A8',
  },
});
