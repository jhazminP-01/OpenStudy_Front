import React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../styles';
import styles from '../RoomScreen.styles';

const RoomHeader = ({ onBack, onLeave, leaving }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={onBack}
      >
        <Ionicons name="chevron-back" size={26} color={COLORS.textWhite} />
      </TouchableOpacity>

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
