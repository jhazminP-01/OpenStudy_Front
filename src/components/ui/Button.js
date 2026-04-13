import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import { COLORS } from '../../styles/colors';

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
        <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.textWhite} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.buttonPrimary,
    marginBottom: 16,
    width: '100%',
  },
  buttonSecondary: {
    backgroundColor: COLORS.buttonSecondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonError: {
    backgroundColor: COLORS.error,
  },
  buttonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
    borderColor: COLORS.buttonDisabled,
  },
  text: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  textOutline: {
    color: COLORS.primary,
  },
});

export default Button;
