import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { subsidyService } from '../../../src/services/api/subsidy.service';
import { CustomButton } from '../../../src/components/ui/CustomButton';
import { CustomCard } from '../../../src/components/ui/CustomCard';
import { RADIUS, SPACING } from '../../../src/constants/theme';

export default function QRScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loadingShop, setLoadingShop] = useState(false);
  const [fetchedShopDetails, setFetchedShopDetails] = useState<any>(null);
  const [apiErrorReason, setApiErrorReason] = useState<string | null>(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    if (scanned || loadingShop) return;
    setScanned(true);
    setLoadingShop(true);
    setApiErrorReason(null);
    setFetchedShopDetails(null);

    let shopCode = data.trim();
    if (!shopCode) shopCode = '20';

    try {
      const res = await subsidyService.getShopDetails(shopCode);

      // Check success flags strictly
      const isSuccess =
        res?.success === true ||
        res?.Success === true ||
        (res?.data && res?.success !== false);

      if (!isSuccess || res?.success === false) {
        const errorMsg =
          res?.errorMessage ||
          res?.Message ||
          res?.message ||
          "Invalid object name 'EPP.DBO.SHOP'";
        setApiErrorReason(errorMsg);
        return;
      }

      const dataObj = res?.data || res?.Data || res;
      setFetchedShopDetails(dataObj);
    } catch (err: any) {
      const errMsg = err?.message || err?.data?.errorMessage || "Invalid object name 'EPP.DBO.SHOP'";
      setApiErrorReason(errMsg);
    } finally {
      setLoadingShop(false);
    }
  };

  const handleContinueToPayment = () => {
    if (!fetchedShopDetails) return;
    const shopData = fetchedShopDetails;
    setFetchedShopDetails(null);
    router.push({
      pathname: '/(main)/subsidy/confirm-payment' as any,
      params: {
        shopDetailsJson: JSON.stringify(shopData),
      },
    });
  };

  const handleSimulateScan = () => {
    handleBarCodeScanned({ type: 'qr', data: '20' });
  };

  const handleScanAgain = () => {
    setApiErrorReason(null);
    setFetchedShopDetails(null);
    setScanned(false);
  };

  const handleCancel = () => {
    setApiErrorReason(null);
    setFetchedShopDetails(null);
    router.replace('/(main)/subsidy' as any);
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0A57A8" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safeAreaDark}>
        <CustomCard style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionBody}>
            We need your permission to access the camera in order to scan merchant QR codes.
          </Text>
          <CustomButton
            title="Grant Camera Permission"
            onPress={requestPermission}
            size="large"
          />
        </CustomCard>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlayContainer}>
          {/* Top Instruction Banner */}
          <View style={styles.topBanner}>
            <Text style={styles.instructionTitle}>Scan Merchant QR Code</Text>
            <Text style={styles.instructionBody}>
              Position the QR code inside the frame to pay
            </Text>
          </View>

          {/* Center Scan Window with Infoline Blue Frame & Red Laser Line Overlay */}
          <View style={styles.scanWindow}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {/* Red Scan Line Overlay */}
            <View style={styles.redScanLine} />
          </View>

          {/* Bottom Actions */}
          <View style={styles.bottomBanner}>
            {loadingShop ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.loadingText}>Fetching merchant shop details...</Text>
              </View>
            ) : (
              <>
                <CustomButton
                  title="⚡ Quick Simulation (Test QR)"
                  onPress={handleSimulateScan}
                  variant="outline"
                  size="medium"
                  style={styles.simBtn}
                  textStyle={{ color: '#FFFFFF' }}
                />
                {scanned && !fetchedShopDetails && !apiErrorReason && (
                  <TouchableOpacity
                    style={styles.rescanBtn}
                    onPress={handleScanAgain}
                  >
                    <Text style={styles.rescanText}>Tap to Scan Again</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {/* 1. SUCCESS: Merchant Details Modal Popup before Payment */}
          <Modal
            visible={!!fetchedShopDetails}
            transparent={true}
            animationType="slide"
            onRequestClose={handleScanAgain}
          >
            <View style={styles.modalOverlay}>
              {fetchedShopDetails && (
                <CustomCard style={styles.merchantCard}>
                  <View style={styles.shopBadgeCircle}>
                    <Text style={styles.shopBadgeIcon}>🏬</Text>
                  </View>
                  <Text style={styles.verifiedTag}>✓ VERIFIED MERCHANT OUTLET</Text>
                  <Text style={styles.merchantName}>
                    {fetchedShopDetails.SHOP_DESCRIPTION || fetchedShopDetails.Merchant_Name || 'Merchant Outlet'}
                  </Text>
                  
                  <View style={styles.merchantInfoGrid}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Shop Code:</Text>
                      <Text style={styles.infoValue}>
                        #{fetchedShopDetails.MMS_SHOP_CODE || fetchedShopDetails.Shop_Code}
                      </Text>
                    </View>
                    {fetchedShopDetails.Category && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Category:</Text>
                        <Text style={styles.infoValue}>{fetchedShopDetails.Category}</Text>
                      </View>
                    )}
                  </View>

                  <CustomButton
                    title="Continue to Payment"
                    onPress={handleContinueToPayment}
                    size="large"
                    style={styles.continueBtn}
                  />

                  <CustomButton
                    title="Scan Different QR Code"
                    onPress={handleScanAgain}
                    variant="text"
                    size="medium"
                  />
                </CustomCard>
              )}
            </View>
          </Modal>

          {/* 2. ERROR: getShopDetails API Failure Popup */}
          <Modal
            visible={!!apiErrorReason}
            transparent={true}
            animationType="fade"
            onRequestClose={handleScanAgain}
          >
            <View style={styles.modalOverlay}>
              <CustomCard style={styles.errorCard}>
                <View style={styles.errorCircle}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                </View>

                <Text style={styles.errorTitle}>Unable to load merchant details.</Text>
                
                <View style={styles.reasonBox}>
                  <Text style={styles.reasonHeader}>Reason:</Text>
                  <Text style={styles.reasonBody}>{apiErrorReason}</Text>
                </View>

                <View style={styles.errorButtonRow}>
                  <CustomButton
                    title="Scan Again"
                    onPress={handleScanAgain}
                    size="medium"
                    style={styles.scanAgainBtn}
                  />
                  <CustomButton
                    title="Cancel"
                    onPress={handleCancel}
                    variant="outline"
                    size="medium"
                    style={styles.cancelBtn}
                  />
                </View>
              </CustomCard>
            </View>
          </Modal>
        </View>
      </CameraView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  safeAreaDark: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  permissionCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: SPACING.xs,
  },
  permissionBody: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  topBanner: {
    backgroundColor: 'rgba(10, 87, 168, 0.85)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    marginTop: 20,
  },
  instructionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  instructionBody: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  scanWindow: {
    width: 260,
    height: 260,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#0A57A8',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  redScanLine: {
    width: '90%',
    height: 3,
    backgroundColor: '#E31E24',
    shadowColor: '#E31E24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  bottomBanner: {
    width: '100%',
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: RADIUS.full,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 10,
  },
  simBtn: {
    width: '100%',
    borderColor: '#0A57A8',
    backgroundColor: 'rgba(10, 87, 168, 0.4)',
  },
  rescanBtn: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: RADIUS.full,
  },
  rescanText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  merchantCard: {
    width: '100%',
    maxWidth: 360,
    padding: SPACING.xl,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
  },
  shopBadgeCircle: {
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
  verifiedTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E31E24',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  merchantName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  merchantInfoGrid: {
    width: '100%',
    backgroundColor: '#F7F9FC',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  continueBtn: {
    width: '100%',
    backgroundColor: '#0A57A8',
    marginBottom: SPACING.xs,
  },
  errorCard: {
    width: '100%',
    maxWidth: 360,
    padding: SPACING.xl,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
  },
  errorCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DC2626' + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  errorIcon: {
    fontSize: 28,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  reasonBox: {
    width: '100%',
    backgroundColor: '#FEF2F2',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginBottom: SPACING.lg,
  },
  reasonHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  reasonBody: {
    fontSize: 13,
    color: '#7F1D1D',
    fontWeight: '600',
    lineHeight: 18,
  },
  errorButtonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
  },
  scanAgainBtn: {
    flex: 1,
    backgroundColor: '#0A57A8',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderColor: '#6B7280',
  },
});
