import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../styles';

const Card = ({ children, style }) => {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: SPACING.borderRadius.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
});

export default Card;
