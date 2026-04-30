import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles';
import { Ionicons } from '@expo/vector-icons';
import { roomsService } from '../../services/rooms';
import { useAuth } from '../../hooks/useAuth';

const ModalRoomDetails = ({ visible, roomId, onClose }) => {
  const { user } = useAuth();
  const [roomDetails, setRoomDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const loadRoomDetails = useCallback(async () => {
    if (!roomId) return;
    
    try {
      setLoading(true);
      const { data, error } = await roomsService.getRoomDetails(roomId);
      
      if (error) {
        console.error('Error loading room details:', error);
        Alert.alert('Error', 'No se pudo cargar la información de la sala');
        onClose();
        return;
      }
      
      setRoomDetails(data);
    } catch (error) {
      console.error('Error loading room details:', error);
      Alert.alert('Error', 'Ocurrió un error al cargar la sala');
      onClose();
    } finally {
      setLoading(false);
    }
  }, [roomId, onClose]);

  useEffect(() => {
    if (visible && roomId) {
      loadRoomDetails();
    }
  }, [visible, roomId, loadRoomDetails]);

  const handleJoinRoom = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Debes iniciar sesión para unirte a una sala');
      return;
    }

    setJoining(true);
    const { data, error } = await roomsService.joinRoom(roomId, user.id);

    if (error) {
      if (error.message === 'Ya estás en esta sala') {
        onClose();
        // Aquí podrías navegar a la sala si tienes la navegación disponible
      } else {
        Alert.alert('Error', error.message);
      }
    } else {
      onClose();
      // Aquí podrías navegar a la sala si tienes la navegación disponible
    }
    setJoining(false);
  };

  const activeParticipants = roomDetails?.participacion?.filter(
    p => p.estado_conexion === 'activo' && !p.esta_expulsado
  ) || [];

  const activeParticipantsCount = activeParticipants.length;
  const isFull = activeParticipantsCount >= roomDetails?.capacidad_maxima;
  const isActive = roomDetails?.estado === 'activa';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#2d2d44', '#1a1a2e', '#0f0f1a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalGradient}
          >
            {/* Header con botón de cerrar */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color={COLORS.textRoomsTertiary} />
              </TouchableOpacity>
            </View>

            {/* Contenido */}
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={COLORS.accent} size="large" />
                <Text style={styles.loadingText}>Cargando detalles...</Text>
              </View>
            ) : !roomDetails ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
                <Text style={styles.errorText}>No se pudo cargar la sala</Text>
              </View>
            ) : (
              <>
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

                    <View style={[styles.infoBadge, styles.purpleBadge]}>
                      <Ionicons name="key-outline" size={16} color={COLORS.textWhite} />
                      <Text style={styles.badgeText}>{roomDetails.codigo_invitacion}</Text>
                    </View>
                  </View>

                  {/* Descripción */}
                  {roomDetails.descripcion && (
                    <Text style={styles.roomDescription}>{roomDetails.descripcion}</Text>
                  )}

                  {/* Badge de sala llena */}
                  {isFull && (
                    <View style={styles.fullBadgeCentered}>
                      <Text style={styles.fullText}>Sala llena</Text>
                    </View>
                  )}
                </View>

                {/* Separador */}
                <View style={styles.separator} />

                {/* Sección de Participantes - Solo avatares */}
                {activeParticipantsCount > 0 && (
                  <View style={styles.section}>
                    <View style={styles.avatarsContainer}>
                      {activeParticipants.slice(0, 8).map((participant, index) => (
                        <View key={participant.id} style={styles.participantAvatar}>
                          <View style={[styles.avatarSmall, styles.defaultAvatarSmall]}>
                            <Ionicons name="person" size={16} color={COLORS.textWhite} />
                          </View>
                          {participant.rol === 'moderador' && (
                            <View style={styles.crownSmall}>
                              <Ionicons name="star" size={8} color={COLORS.accent} />
                            </View>
                          )}
                        </View>
                      ))}
                      {activeParticipantsCount > 8 && (
                        <View style={styles.moreParticipants}>
                          <Text style={styles.moreText}>+{activeParticipantsCount - 8}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Separador */}
                <View style={styles.separator} />

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Temporizador Pomodoro</Text>
                  <Text style={styles.placeholderText}>
                    El temporizador sincronizado estará disponible en la próxima actualización.
                  </Text>
                </View>
              </>
            )}
          </ScrollView>

          {/* Botón de acción */}
          {!loading && roomDetails && (
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
          )}
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },

  modalContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: SPACING.borderRadiusRooms.card,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },

  modalGradient: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
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
    paddingVertical: SPACING.xl,
  },

  errorText: {
    ...TYPOGRAPHY.body,
    color: COLORS.error,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },

  roomInfo: {
    paddingVertical: SPACING.sm,
  },

  roomName: {
    ...TYPOGRAPHY.rooms.title,
    color: COLORS.textWhite,
    textAlign: 'center',
    marginBottom: SPACING.md,
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
    marginBottom: SPACING.md,
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

  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.borderRadius.full,
  },

  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.borderRadius.full,
  },

  purpleBadge: {
    backgroundColor: '#8B5CF6',
  },

  badgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textWhite,
    fontWeight: '600',
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

  fullBadgeCentered: {
    alignSelf: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.borderRadius.full,
    backgroundColor: COLORS.error,
    marginTop: SPACING.sm,
  },

  fullText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textWhite,
    fontWeight: '600',
  },

  section: {
    paddingVertical: SPACING.lg,
  },

  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: SPACING.md,
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
  },

  actionSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderRoomsLight,
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

  // Estilos para participantes
  avatarsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },

  participantAvatar: {
    position: 'relative',
    marginRight: -8,
  },

  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#1a1a2e',
  },

  defaultAvatarSmall: {
    backgroundColor: COLORS.backgroundRoomsMedium,
    justifyContent: 'center',
    alignItems: 'center',
  },

  crownSmall: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a1a2e',
  },

  moreParticipants: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundRoomsMedium,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1a1a2e',
  },

  moreText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textRoomsTertiary,
    fontWeight: '600',
  },
});

export default ModalRoomDetails;
