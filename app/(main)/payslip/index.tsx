import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { CustomCard } from '../../../src/components/ui/CustomCard';
import { RADIUS, SPACING } from '../../../src/constants/theme';

export default function PayslipScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A57A8" />
      <View style={styles.container}>
        <CustomCard style={styles.card}>
          <View style={styles.illustrationBox}>
            <Text style={styles.illustrationIcon}>💰</Text>
          </View>

          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>COMING SOON</Text>
          </View>

          <Text style={styles.title}>Payslip</Text>
          <Text style={styles.subtitle}>
            Payslip API is not available yet.{'\n'}
            This module is under development.
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Salary statement records & monthly PDF downloads will be activated as soon as the secure payroll API endpoints are connected.
            </Text>
          </View>
        </CustomCard>
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
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    padding: SPACING.xl,
    alignItems: 'center',
    borderRadius: RADIUS.xl,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  illustrationBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0A57A8' + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  illustrationIcon: {
    fontSize: 40,
  },
  badgePill: {
    backgroundColor: '#E31E24' + '15',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.sm,
  },
  badgeText: {
    color: '#E31E24',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#F7F9FC',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});
