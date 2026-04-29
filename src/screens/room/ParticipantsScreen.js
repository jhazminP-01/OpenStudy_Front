import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles';

const ParticipantsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholderText}>
        La lista de participantes estará disponible en la próxima actualización (HU-06).
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.rooms.paddingX,
  },

  placeholderText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsMuted,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default ParticipantsScreen;
