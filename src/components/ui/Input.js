import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet 
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles';

const Input = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry, 
  error, 
  keyboardType = 'default',
  autoCapitalize = 'none',
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textLight}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    width: '100%',
  },
  label: {
    ...TYPOGRAPHY.label,
    color: COLORS.textWhite,
    marginBottom: SPACING.sm,
  },
  input: {
    height: SPACING.sizes.input.md.height,
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: SPACING.borderRadius.md,
    paddingHorizontal: SPACING.sizes.input.md.paddingHorizontal,
    ...TYPOGRAPHY.body,
    color: COLORS.textWhite,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    ...TYPOGRAPHY.caption,
    marginTop: SPACING.xs,
  },
});

export default Input;
