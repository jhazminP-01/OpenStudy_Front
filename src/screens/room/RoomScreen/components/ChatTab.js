import React from 'react';
import { View, Text } from 'react-native';
import styles from '../RoomScreen.styles';

const ChatTab = () => {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.placeholderTextCenter}>
        El chat en tiempo real estará disponible en la próxima actualización (HU-07).
      </Text>
    </View>
  );
};

export default ChatTab;
