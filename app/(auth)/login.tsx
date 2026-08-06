import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '../../src/utils/validators';
import { useAuth } from '../../src/context/AuthContext';
import { Logo } from '../../src/components/common/Logo';
import { InfolineLogo } from '../../src/components/common/InfolineLogo';
import { CustomInput } from '../../src/components/ui/CustomInput';
import { CustomButton } from '../../src/components/ui/CustomButton';
import { CustomToast } from '../../src/components/ui/CustomToast';
import { COLORS, RADIUS, SPACING } from '../../src/constants/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      User_Name: '',
      User_Password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setSubmitting(true);
    setToastMessage(null);
    try {
      await login(data);
      router.replace('/(main)/dashboard' as any);
    } catch (error: any) {
      const errMsg = error.message || 'Invalid Employee ID or Password';
      setToastMessage(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <CustomToast
            visible={!!toastMessage}
            message={toastMessage || ''}
            type="error"
            onDismiss={() => setToastMessage(null)}
          />

          <View style={styles.topSection}>
            <Logo variant="large" showSubtitle={true} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In to Account</Text>
            <Text style={styles.cardSubtitle}>Enter your Employee credentials below</Text>

            <Controller
              control={control}
              name="User_Name"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  label="Employee ID"
                  placeholder="Enter your Employee ID"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.User_Name?.message}
                  keyboardType="default"
                  autoCapitalize="none"
                />
              )}
            />

            <Controller
              control={control}
              name="User_Password"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  label="Password"
                  placeholder="Enter your password"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.User_Password?.message}
                  secureTextEntry={true}
                />
              )}
            />

            <CustomButton
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              loading={submitting}
              style={styles.loginBtn}
              size="large"
            />
          </View>

          <View style={styles.footerSection}>
            <InfolineLogo />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Clean White Background for Login
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  loginBtn: {
    marginTop: SPACING.lg,
    backgroundColor: '#0A57A8', // Infoline Primary Blue Button
  },
  footerSection: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: SPACING.md,
  },
});
