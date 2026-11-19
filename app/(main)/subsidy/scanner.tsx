import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Animated,
  Easing,
  Linking,
  AppState,
  AppStateStatus,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useIsFocused } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { subsidyService } from '../../../src/services/api/subsidy.service';
import { CustomButton } from '../../../src/components/ui/CustomButton';
import { CustomCard } from '../../../src/components/ui/CustomCard';
import { RADIUS, SPACING } from '../../../src/constants/theme';

export default function QRScannerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const [loadingShop, setLoadingShop] = useState(false);
  const [fetchedShopDetails, setFetchedShopDetails] = useState<any>(null);
  const [apiErrorReason, setApiErrorReason] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [mountError, setMountError] = useState<string | null>(null);
  const [cameraKey, setCameraKey] = useState(0);

  // AppState tracking for clean camera lifecycle
  const [appState, setAppState] = useState<AppStateStatus>((AppState.currentState as AppStateStatus) || 'active');

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      setAppState(nextState);
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const isCameraActive = isFocused && appState === 'active';

  // Duplicate scan protection lock
  const scanLockRef = useRef(false);

  // Animated laser scan line that sweeps strictly within the 260x260 scan frame (0..256px)
  const [scanLineAnim] = useState(() => new Animated.Value(0));

  // Reset scan lock when user returns to screen without active modal
  useEffect(() => {
    if (isFocused && !fetchedShopDetails && !apiErrorReason) {
      scanLockRef.current = false;
    }
  }, [isFocused, fetchedShopDetails, apiErrorReason]);

  // Request permission if not determined
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Laser animation loop
  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (isCameraActive) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 256,
            duration: 2200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      scanLineAnim.setValue(0);
    }

    return () => {
      if (animation) animation.stop();
    };
  }, [isCameraActive, scanLineAnim]);

  // Barcode Scanner Callback with Duplicate Scan Protection
  const handleBarCodeScanned = async ({ data, type }: { type: string; data: string }) => {
    if (scanLockRef.current || scanned || loadingShop) return;
    scanLockRef.current = true;
    setScanned(true);
    setLoadingShop(true);
    setApiErrorReason(null);
    setFetchedShopDetails(null);

    const shopCode = data ? data.trim() : '';
    if (!shopCode) {
      scanLockRef.current = false;
      setScanned(false);
      setApiErrorReason('Invalid or unreadable QR code scanned. Please try again.');
      setLoadingShop(false);
      return;
    }

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

  const handleScanAgain = () => {
    scanLockRef.current = false;
    setApiErrorReason(null);
    setFetchedShopDetails(null);
    setScanned(false);
  };

  const handleBack = () => {
    scanLockRef.current = false;
    setApiErrorReason(null);
    setFetchedShopDetails(null);
    setScanned(false);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(main)/subsidy' as any);
    }
  };

  const handleRetryCamera = () => {
    setMountError(null);
    setIsCameraReady(false);
    setCameraKey((prev) => prev + 1);
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
      <View style={styles.safeAreaDark}>
        <CustomCard style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionBody}>
            We need your permission to access the camera in order to scan merchant QR codes.
          </Text>
          {permission.canAskAgain ? (
            <CustomButton
              title="Grant Camera Permission"
              onPress={requestPermission}
              size="large"
              style={styles.permissionBtn}
            />
          ) : (
            <CustomButton
              title="Open Device Settings"
              onPress={() => Linking.openSettings()}
              size="large"
              style={styles.permissionBtn}
            />
          )}
          <CustomButton
            title="Go Back"
            onPress={handleBack}
            variant="outline"
            size="medium"
            style={styles.permissionBackBtn}
          />
        </CustomCard>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* 1. Base Layer: Full-Screen Live Camera Preview */}
      {permission.granted && isCameraActive && (
        <CameraView
          key={'camera-instance-' + cameraKey}
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torch}
          active={isCameraActive}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onCameraReady={() => {
            setIsCameraReady(true);
            setMountError(null);
          }}
          onMountError={(error) => {
            setMountError(error?.message || 'Camera failed to initialize');
          }}
          onBarcodeScanned={scanned || loadingShop ? undefined : handleBarCodeScanned}
        />
      )}

      {/* 2. Top Safe-Area Header Bar (pinned at top, zIndex: 10) */}
      <View style={[styles.headerBar, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>QR Scanner</Text>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={[styles.torchButton, torch && styles.torchButtonActive]}
            onPress={() => setTorch((prev) => !prev)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
          >
            <Text style={styles.torchIcon}>{torch ? '🔦' : '💡'}</Text>
            <Text style={styles.torchText}>{torch ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => Linking.openSettings()}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Full-Screen 3-Row Flex Overlay Mask (Starts Below Header, Covers 100% of remaining screen) */}
      <View style={styles.overlayContainer} pointerEvents="box-none">
        {/* Top Mask */}
        <View style={styles.topMask} pointerEvents="none" />

        {/* Middle Row: Left Mask, 260x260 Viewfinder, Right Mask */}
        <View style={styles.middleRow} pointerEvents="box-none">
          <View style={styles.sideMask} pointerEvents="none" />

          {/* Center 260x260 Viewfinder */}
          <View style={styles.viewfinder}>
            {/* 4 Infoline Blue Corner Brackets */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {/* Animated Red Laser Scan Line strictly bounded inside 0..260px */}
            <Animated.View
              style={[
                styles.redScanLine,
                {
                  transform: [{ translateY: scanLineAnim }],
                },
              ]}
            />

            {/* Initialization spinner */}
            {!isCameraReady && !mountError && (
              <View style={styles.initializingBox} pointerEvents="none">
                <ActivityIndicator size="small" color="#0A57A8" />
              </View>
            )}

            {/* Mount Error Fallback */}
            {mountError && (
              <View style={styles.mountErrorBox}>
                <Text style={styles.mountErrorTitle}>Camera Error</Text>
                <Text style={styles.mountErrorMsg}>{mountError}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={handleRetryCamera}>
                  <Text style={styles.retryBtnText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.sideMask} pointerEvents="none" />
        </View>

        {/* Bottom Mask: Clear Unclipped Instructions & Actions */}
        <View
          style={[
            styles.bottomMask,
            { paddingBottom: Math.max(insets.bottom, 24) },
          ]}
          pointerEvents="box-none"
        >
          <Text style={styles.instructionTitle}>Position QR Code in Frame</Text>
          <Text style={styles.instructionBody}>
            Align the QR code within the frame to scan
          </Text>

          {loadingShop && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.loadingText}>Fetching merchant shop details...</Text>
            </View>
          )}

          {scanned && !loadingShop && !fetchedShopDetails && !apiErrorReason && (
            <TouchableOpacity
              style={styles.rescanBtn}
              onPress={handleScanAgain}
              activeOpacity={0.7}
            >
              <Text style={styles.rescanText}>Tap to Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 4. SUCCESS: Merchant Details Modal Popup before Payment */}
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

      {/* 5. ERROR: getShopDetails API Failure Popup */}
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
                onPress={handleBack}
                variant="outline"
                size="medium"
                style={styles.cancelBtn}
              />
            </View>
          </CustomCard>
        </View>
      </Modal>
    </View>
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
    width: '100%',
    maxWidth: 360,
    padding: SPACING.xl,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  permissionBody: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  permissionBtn: {
    width: '100%',
    backgroundColor: '#0A57A8',
    marginBottom: SPACING.sm,
  },
  permissionBackBtn: {
    width: '100%',
  },
  headerBar: {
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingRight: 10,
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    marginRight: 6,
    fontWeight: '700',
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  torchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  torchButtonActive: {
    backgroundColor: '#0A57A8',
    borderColor: '#FFFFFF',
  },
  torchIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  torchText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  settingsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 16,
  },
  overlayContainer: {
    flex: 1,
  },
  topMask: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  middleRow: {
    flexDirection: 'row',
    height: 260,
  },
  sideMask: {
    flex: 1,
    height: 260,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  viewfinder: {
    width: 260,
    height: 260,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 36,
    height: 36,
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#E31E24',
    shadowColor: '#E31E24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 4,
  },
  initializingBox: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mountErrorBox: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  mountErrorTitle: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  mountErrorMsg: {
    color: '#FFFFFF',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  retryBtn: {
    backgroundColor: '#0A57A8',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: RADIUS.full,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomMask: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  instructionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 6,
  },
  instructionBody: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: RADIUS.full,
    marginTop: 20,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 10,
  },
  rescanBtn: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  rescanText: {
    color: '#FFFFFF',
    fontSize: 14,
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
