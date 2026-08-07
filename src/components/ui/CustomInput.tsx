import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

export interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  secureTextEntry?: boolean;
}

export const CustomInput: React.FC<CustomInputProps> = React.memo(({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  secureTextEntry = false,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const inputRef = useRef<TextInput>(null);

  const handleWrapperPress = () => {
    inputRef.current?.focus();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        style={[
          styles.inputWrapper,
          isFocused && styles.focusedWrapper,
          error ? styles.errorWrapper : null,
        ]}
        onPress={handleWrapperPress}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        <TextInput
          ref={inputRef}
          style={[styles.input, style]}
          placeholderTextColor={COLORS.textMuted}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          secureTextEntry={isSecure}
          {...props}
        />
        {secureTextEntry ? (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={() => setIsSecure(!isSecure)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel={isSecure ? "Show password" : "Hide password"}
            accessibilityRole="button"
          >
            <Ionicons
              name={isSecure ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.rightIconContainer}>{rightIcon}</View>
        ) : null}
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
});

CustomInput.displayName = 'CustomInput';

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    minHeight: 50,
  },
  focusedWrapper: {
    borderColor: '#0A57A8',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0A57A8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  errorWrapper: {
    borderColor: COLORS.danger,
    backgroundColor: '#FEF2F2',
  },
  input: {
    flex: 1,
    alignSelf: 'stretch',
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.sm,
  },
  leftIconContainer: {
    marginRight: SPACING.sm,
  },
  rightIconContainer: {
    marginLeft: SPACING.sm,
  },
  eyeText: {
    fontSize: 16,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
