import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../styles';
import styles from '../RoomScreen.styles';

const RoomInfoTab = ({ roomData, participantsCount }) => {
  return (
    <ScrollView style={styles.tabContent}>
      <View style={styles.roomInfo}>
        <View style={styles.iconContainer}>
          <Ionicons name="people" size={48} color={COLORS.textWhite} />
        </View>

        <Text style={styles.roomName}>{roomData.nombre}</Text>

        {roomData.descripcion && (
          <Text style={styles.roomDescription}>{roomData.descripcion}</Text>
        )}

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="book-outline" size={20} color={COLORS.textRoomsSecondary} />
            <Text style={styles.infoText}>{roomData.materia?.nombre || 'Materia'}</Text>
          </View>

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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Temporizador Pomodoro</Text>
        <Text style={styles.placeholderText}>
          El temporizador sincronizado estará disponible en la próxima actualización.
        </Text>
      </View>
    </ScrollView>
  );
};

export default RoomInfoTab;
