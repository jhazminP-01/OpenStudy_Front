import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles';
import { Ionicons } from '@expo/vector-icons';
import { roomsService } from '../../services/rooms';
import { useAuth } from '../../hooks/useAuth';
import AppModal from '../../components/ui/ErrorModal';

const RoomDetailsScreen = ({ route, navigation }) => {
  const { roomId } = route.params;
  const { user } = useAuth();
  const [roomDetails, setRoomDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, type: 'error', title: '', message: '' });

  const loadRoomDetails = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await roomsService.getRoomDetails(roomId);
      
      if (error) {
        console.error('Error loading room details:', error);
        setErrorModal({
          visible: true,
          type: 'error',
          title: 'Error',
          message: 'No se pudo cargar la información de la sala'
        });
        navigation.goBack();
        return;
      }
      
      setRoomDetails(data);
    } catch (error) {
      console.error('Error loading room details:', error);
      setErrorModal({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'Ocurrió un error al cargar la sala'
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [roomId, navigation]);

  useEffect(() => {
    loadRoomDetails();
  }, [loadRoomDetails]);

  const handleJoinRoom = async () => {
    if (!user?.id) {
      setErrorModal({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'Debes iniciar sesión para unirte a una sala'
      });
      return;
    }

    setJoining(true);
    const { data, error } = await roomsService.joinRoom(roomId, user.id);

    if (error) {
      if (error.message === 'Ya estás en esta sala') {
        navigation.navigate('Room', { roomId });
      } else {
        setErrorModal({
          visible: true,
          type: 'error',
          title: 'Error',
          message: error.message
        });
      }
    } else {
      navigation.navigate('Room', { roomId });
    }
    setJoining(false);
  };

  const activeParticipantsCount = roomDetails?.participacion?.filter(
    p => p.estado_conexion === 'activo' && !p.esta_expulsado
  ).length || 0;

  const isFull = activeParticipantsCount >= roomDetails?.capacidad_maxima;
  const isActive = roomDetails?.estado === 'activa';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.accent} size="large" />
        <Text style={styles.loadingText}>Cargando detalles...</Text>
      </View>
    );
  }

  if (!roomDetails) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
        <Text style={styles.errorText}>No se pudo cargar la sala</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={COLORS.gradientRooms}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
      <View style={styles.roomInfo}>
        <View style={styles.iconContainer}>
          <Ionicons name="people" size={48} color={COLORS.textWhite} />
        </View>

        <Text style={styles.roomName}>{roomDetails.nombre}</Text>

        {roomDetails.descripcion && (
          <Text style={styles.roomDescription}>{roomDetails.descripcion}</Text>
        )}

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="book-outline" size={20} color={COLORS.textRoomsSecondary} />
            <Text style={styles.infoText}>{roomDetails.materia?.nombre || 'Materia'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={20} color={COLORS.textRoomsSecondary} />
            <Text style={styles.infoText}>
              {activeParticipantsCount}/{roomDetails.capacidad_maxima} participantes
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="key-outline" size={20} color={COLORS.iconCode} />
            <Text style={styles.infoText}>{roomDetails.codigo_invitacion}</Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusInactive]}>
            <Text style={[styles.statusText, isActive ? styles.statusActiveText : styles.statusInactiveText]}>
              {isActive ? 'Activa' : 'Inactiva'}
            </Text>
          </View>
          
          {isFull && (
            <View style={styles.fullBadge}>
              <Text style={styles.fullText}>Sala llena</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Participantes Activos</Text>
        {activeParticipantsCount > 0 ? (
          <Text style={styles.participantsText}>
            {activeParticipantsCount} participantes conectados actualmente
          </Text>
        ) : (
          <Text style={styles.noParticipantsText}>
            No hay participantes activos en este momento
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Temporizador Pomodoro</Text>
        <Text style={styles.placeholderText}>
          El temporizador sincronizado estará disponible en la próxima actualización.
        </Text>
      </View>

      <View style={styles.actionSection}>
        <TouchableOpacity
          style={[styles.joinButton, isFull && styles.joinButtonDisabled]}
          onPress={handleJoinRoom}
          disabled={joining || isFull || !isActive}
        >
          <LinearGradient
            colors={isFull || !isActive ? COLORS.gradientDisabled : COLORS.gradientButton}
            style={styles.joinButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {joining ? (
              <ActivityIndicator color={COLORS.textWhite} size="small" />
            ) : (
              <Text style={styles.joinButtonText}>
                {isFull ? 'Sala llena' : !isActive ? 'Sala inactiva' : 'Unirse a sala'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>

    <AppModal
      visible={errorModal.visible}
      type={errorModal.type}
      title={errorModal.title}
      message={errorModal.message}
      onClose={() => setErrorModal({ visible: false, type: 'error', title: '', message: '' })}
    />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

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
    ...TYPOGRAPHY.caption,
    color: COLORS.textRoomsTertiary,
  },

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },

  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.borderRadius.full,
  },

  statusActive: {
    backgroundColor: COLORS.success,
  },

  statusInactive: {
    backgroundColor: COLORS.textRoomsTertiary,
  },

  statusText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },

  statusActiveText: {
    color: COLORS.textWhite,
  },

  statusInactiveText: {
    color: COLORS.textWhite,
  },

  fullBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.borderRadius.full,
    backgroundColor: COLORS.error,
  },

  fullText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textWhite,
    fontWeight: '600',
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

  participantsText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsSecondary,
    textAlign: 'center',
  },

  noParticipantsText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  placeholderText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsTertiary,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  actionSection: {
    paddingHorizontal: SPACING.rooms.paddingX,
    paddingVertical: SPACING.xl,
  },

  joinButton: {
    borderRadius: SPACING.borderRadius.lg,
    overflow: 'hidden',
  },

  joinButtonDisabled: {
    opacity: 0.6,
  },

  joinButtonGradient: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  joinButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textWhite,
    fontWeight: '600',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundDark,
  },

  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsSecondary,
    marginTop: SPACING.sm,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundDark,
    paddingHorizontal: SPACING.lg,
  },

  errorText: {
    ...TYPOGRAPHY.body,
    color: COLORS.error,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});

export default RoomDetailsScreen;
