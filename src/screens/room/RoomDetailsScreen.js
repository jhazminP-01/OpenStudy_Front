import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles';
import { Ionicons } from '@expo/vector-icons';

const RoomDetailsScreen = ({ roomData }) => {
  const participantsCount = roomData?.participacion?.length || 0;

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.roomInfo}>
        <View style={styles.iconContainer}>
          <Ionicons name="people" size={48} color={COLORS.textWhite} />
        </View>

        <Text style={styles.roomName}>{roomData?.nombre}</Text>

        {roomData?.descripcion && (
          <Text style={styles.roomDescription}>{roomData.descripcion}</Text>
        )}

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="book-outline" size={20} color={COLORS.textRoomsSecondary} />
            <Text style={styles.infoText}>{roomData?.materia?.nombre || 'Materia'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={20} color={COLORS.textRoomsSecondary} />
            <Text style={styles.infoText}>{participantsCount}/{roomData?.capacidad_maxima}</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="key-outline" size={20} color={COLORS.iconCode} />
            <Text style={styles.infoText}>{roomData?.codigo_invitacion}</Text>
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

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },

  roomInfo: {
    paddingHorizontal: SPACING.rooms.paddingX,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.backgroundRoomsMedium,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
  },

  roomName: {
    ...TYPOGRAPHY.rooms.title,
    color: COLORS.textWhite,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },

  roomDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: SPACING.md,
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },

  infoText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsSecondary,
  },

  section: {
    paddingHorizontal: SPACING.rooms.paddingX,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderRoomsLight,
  },

  sectionTitle: {
    ...TYPOGRAPHY.rooms.sectionTitle,
    color: COLORS.textWhite,
    marginBottom: SPACING.sm,
  },

  placeholderText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsMuted,
    fontStyle: 'italic',
  },
});

export default RoomDetailsScreen;
