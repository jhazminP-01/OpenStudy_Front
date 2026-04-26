import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles';

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  isLoading = false, 
  disabled = false,
  style 
}) => {
  const buttonStyles = [
    styles.button,
    variant === 'secondary' && styles.buttonSecondary,
    variant === 'outline' && styles.buttonOutline,
    variant === 'error' && styles.buttonError,
    (disabled || isLoading) && styles.buttonDisabled,
    style
  ];

  const textStyles = [
    styles.text,
    variant === 'outline' && styles.textOutline,
  ];

  return (
    <TouchableOpacity 
      style={buttonStyles} 
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.textWhite : COLORS.textWhite} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: SPACING.borderRadiusRooms.button,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.filterChipSelected,
    marginBottom: 16,
    width: '100%',
  },
  buttonSecondary: {
    backgroundColor: COLORS.buttonSecondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.borderRoomsMedium,
  },
  buttonError: {
    backgroundColor: COLORS.error,
  },
  buttonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
    borderColor: COLORS.buttonDisabled,
  },
  text: {
    ...TYPOGRAPHY.body,
    color: COLORS.textWhite,
    fontWeight: TYPOGRAPHY.rooms.title.fontWeight,
  },
  textOutline: {
    color: COLORS.textWhite,
  },
});

export default Button;
