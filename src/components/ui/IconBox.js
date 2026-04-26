import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../styles';

const IconBox = ({ icon, size = 80, backgroundColor, style }) => {
  return (
    <View style={[styles.container, { width: size, height: size, backgroundColor }, style]}>
      <Text style={[styles.icon, { fontSize: size * 0.5 }]}>{icon}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.backgroundRoomsDark,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: COLORS.textWhite,
  },
});

export default IconBox;
