import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../styles';
import styles from '../ModalRoomDetails.styles';

const RoomInfoSection = ({ roomDetails, activeParticipantsCount, isFull, isActive }) => {
  return (
    <View style={styles.roomInfo}>
      {/* Nombre de la sala arriba */}
      <Text style={styles.roomName}>{roomDetails.nombre}</Text>

      {/* Materia */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="book-outline" size={18} color={COLORS.textRoomsSecondary} />
          <Text style={styles.infoText}>{roomDetails.materia?.nombre || 'Materia'}</Text>
        </View>
      </View>

      {/* Estado, contador y código en la misma línea */}
      <View style={styles.infoRow}>
        <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusInactive]}>
          <Text style={[styles.statusText, isActive ? styles.statusActiveText : styles.statusInactiveText]}>
            {isActive ? 'Activa' : 'Inactiva'}
          </Text>
        </View>

        <View style={[styles.infoBadge, styles.purpleBadge]}>
          <Ionicons name="people-outline" size={16} color={COLORS.textWhite} />
          <Text style={styles.badgeText}>
            {activeParticipantsCount}/{roomDetails.capacidad_maxima}
          </Text>
        </View>

        <View style={[styles.infoBadge, styles.yellowBadge]}>
          <Ionicons name="key-outline" size={16} color={COLORS.iconCode} />
          <Text style={[styles.badgeText, styles.badgeTextBold]}>{roomDetails.codigo_invitacion}</Text>
        </View>
      </View>

      {/* Descripción en recuadro */}
      {roomDetails.descripcion && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.roomDescription}>{roomDetails.descripcion}</Text>
        </View>
      )}

      {/* Badge de sala llena */}
      {isFull && (
        <View style={styles.fullBadgeCentered}>
          <Text style={styles.fullText}>Sala llena</Text>
        </View>
      )}
    </View>
  );
};

export default RoomInfoSection;
