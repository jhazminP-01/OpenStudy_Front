import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../styles';

const Checkbox = ({ checked, onPress, disabled, style }) => {
  return (
    <TouchableOpacity
      style={[styles.checkbox, disabled && styles.checkboxDisabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={1}
    >
      <View style={[styles.checkboxInner, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkbox: {
    width: 24,
    height: 24,
  },
  checkboxDisabled: {
    opacity: 0.5,
  },
  checkboxInner: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderColor: COLORS.borderRoomsMedium,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.filterChipSelected,
    borderColor: COLORS.filterChipSelected,
  },
  checkmark: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Checkbox;
