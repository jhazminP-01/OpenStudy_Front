import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../styles';
import { Ionicons } from '@expo/vector-icons';
import { roomsService } from '../../../services/rooms';
import { useAuth } from '../../../hooks/useAuth';
import { RoomInfoSection, ParticipantsAvatars, JoinButton } from './components';
import styles from './ModalRoomDetails.styles';

const ModalRoomDetails = ({ visible, roomId, onClose, navigation }) => {
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
        navigation?.navigate('Room', { roomId });
      } else {
        Alert.alert('Error', error.message);
      }
    } else {
      onClose();
      navigation?.navigate('Room', { roomId });
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
            colors={COLORS.gradientRooms}
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
                  <ActivityIndicator color={COLORS.primary} size="large" />
                  <Text style={styles.loadingText}>Cargando detalles...</Text>
                </View>
              ) : !roomDetails ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
                  <Text style={styles.errorText}>No se pudo cargar la sala</Text>
                </View>
              ) : (
                <>
                  <RoomInfoSection
                    roomDetails={roomDetails}
                    activeParticipantsCount={activeParticipantsCount}
                    isFull={isFull}
                    isActive={isActive}
                  />

                  {/* Sección de Participantes en recuadro */}
                  <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Participantes</Text>
                    <ParticipantsAvatars participants={activeParticipants} maxVisible={8} />
                  </View>

                  {/* Sección de Temporizador en recuadro */}
                  <View style={styles.sectionCard}>
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
                <JoinButton
                  onPress={handleJoinRoom}
                  isJoining={joining}
                  isFull={isFull}
                  isActive={isActive}
                />
              </View>
            )}
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

export default ModalRoomDetails;
