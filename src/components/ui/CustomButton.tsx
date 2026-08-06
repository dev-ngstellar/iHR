import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { COLORS, RADIUS } from '../../constants/theme';

export interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const CustomButton: React.FC<CustomButtonProps> = React.memo(({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  const getContainerStyle = (): ViewStyle => {
    let base: ViewStyle = { ...styles.button };

    if (size === 'small') {
      base = { ...base, paddingVertical: 8, paddingHorizontal: 14, minHeight: 38 };
    } else if (size === 'large') {
      base = { ...base, paddingVertical: 16, paddingHorizontal: 24, minHeight: 54 };
    } else {
      base = { ...base, paddingVertical: 12, paddingHorizontal: 20, minHeight: 46 };
    }

    switch (variant) {
      case 'secondary':
      case 'outline':
        base.backgroundColor = '#FFFFFF';
        base.borderWidth = 1.5;
        base.borderColor = '#0A57A8';
        break;
      case 'text':
        base.backgroundColor = 'transparent';
        base.elevation = 0;
        base.shadowOpacity = 0;
        break;
      case 'danger':
        base.backgroundColor = '#E31E24'; // Infoline Primary Red
        break;
      case 'primary':
      default:
        base.backgroundColor = '#0A57A8'; // Infoline Primary Blue
        break;
    }

    if (disabled || loading) {
      base.opacity = 0.6;
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    let base: TextStyle = { ...styles.text };

    if (size === 'small') base.fontSize = 13;
    if (size === 'large') base.fontSize = 16;

    switch (variant) {
      case 'secondary':
      case 'outline':
      case 'text':
        base.color = '#0A57A8';
        break;
      default:
        base.color = '#FFFFFF';
        break;
    }

    return base;
  };

  return (
    <TouchableOpacity
      style={[getContainerStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'text' || variant === 'secondary' ? '#0A57A8' : '#FFFFFF'} />
      ) : (
        <>
          {leftIcon}
          <Text style={[getTextStyle(), leftIcon ? { marginLeft: 8 } : null, rightIcon ? { marginRight: 8 } : null, textStyle]}>
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
});

CustomButton.displayName = 'CustomButton';

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  text: {
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.3,
  },
});
