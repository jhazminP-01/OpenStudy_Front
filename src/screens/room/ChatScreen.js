import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles';

const ChatScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholderText}>
        El chat en tiempo real estará disponible en la próxima actualización (HU-07).
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

export default ChatScreen;
