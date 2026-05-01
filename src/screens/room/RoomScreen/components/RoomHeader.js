import React from 'react';
import { View, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../styles';
import styles from '../RoomScreen.styles';

const RoomHeader = ({ roomName, onLeave, leaving }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.roomTitle}>{roomName}</Text>
      
      <TouchableOpacity
        style={styles.headerButton}
        onPress={onLeave}
        disabled={leaving}
      >
        {leaving ? (
          <ActivityIndicator color={COLORS.textWhite} size="small" />
        ) : (
          <Ionicons name="exit-outline" size={22} color={COLORS.error} />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default RoomHeader;
