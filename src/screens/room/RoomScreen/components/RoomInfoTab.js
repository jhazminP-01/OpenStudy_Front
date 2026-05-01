import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../styles';
import { TimerTab } from '../../../../components/ui/Timer';
import styles from '../RoomScreen.styles';

const RoomInfoTab = ({ roomData, participantsCount, roomId }) => {
  return (
    <ScrollView style={styles.tabContent}>
      {/* Temporizador Pomodoro real */}
      <TimerTab roomId={roomId} />

      <View style={styles.roomInfo}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={20} color={COLORS.textRoomsSecondary} />
            <Text style={styles.infoText}>{participantsCount}/{roomData.capacidad_maxima}</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="key-outline" size={20} color={COLORS.iconCode} />
            <Text style={styles.infoText}>{roomData.codigo_invitacion}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default RoomInfoTab;
