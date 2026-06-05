import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../styles';
import { Ionicons } from '@expo/vector-icons';
import { roomsService } from '../../../services/rooms';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../../lib/supabase';
import { timerService } from '../../../services/timer';
import { RoomInfoSection, ParticipantsAvatars, JoinButton } from './components';
import TimerSection from './components/TimerSection';
import AppModal from '../ErrorModal';
import styles from './ModalRoomDetails.styles';

const ModalRoomDetails = ({ visible, roomId, onClose, navigation }) => {
  const { user } = useAuth();
  const [roomDetails, setRoomDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [timerData, setTimerData] = useState(undefined);
  const [timerTimeLeft, setTimerTimeLeft] = useState(0);
  const [errorModal, setErrorModal] = useState({ visible: false, type: 'error', title: '', message: '' });
  const timerChannelRef = useRef(null);
  const timerIntervalRef = useRef(null);

  const loadRoomDetails = useCallback(async () => {
    if (!roomId) return;
    
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
        onClose();
        return;
      }
      
      setRoomDetails(data);

      const { data: timer } = await supabase
        .from('pomodoro_estado')
        .select('*')
        .eq('sala_id', roomId)
        .maybeSingle();
      setTimerData(timer);
      setTimerTimeLeft(timerService.calculateTimeLeft(timer));
    } catch (error) {
      console.error('Error loading room details:', error);
      setErrorModal({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'Ocurrió un error al cargar la sala'
      });
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

  // Suscripción Realtime + countdown local mientras el modal está abierto
  useEffect(() => {
    if (!visible || !roomId) return;

    // Suscripción a cambios en pomodoro_estado
    timerChannelRef.current = supabase
      .channel(`pomodoro_modal:${roomId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'pomodoro_estado',
        filter: `sala_id=eq.${roomId}`,
      }, (payload) => {
        const newTimer = payload.new;
        setTimerData(newTimer);
        setTimerTimeLeft(timerService.calculateTimeLeft(newTimer));
      })
      .subscribe();

    // Countdown local de 1 segundo
    timerIntervalRef.current = setInterval(() => {
      setTimerData((prev) => {
        if (!prev || prev.estado !== 'activo') return prev;
        setTimerTimeLeft((t) => Math.max(0, t - 1));
        return prev;
      });
    }, 1000);

    return () => {
      if (timerChannelRef.current) {
        supabase.removeChannel(timerChannelRef.current);
        timerChannelRef.current = null;
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [visible, roomId]);

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
        onClose();
        navigation?.navigate('Room', { roomId });
      } else {
        setErrorModal({
          visible: true,
          type: 'error',
          title: 'Error',
          message: error.message
        });
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
                    <View style={styles.timerHeader}>
                      <Text style={styles.timerEmoji}>🍅</Text>
                      <Text style={styles.sectionTitle}>Temporizador Pomodoro</Text>
                    </View>
                    <TimerSection timerData={timerData ?? null} timeLeft={timerTimeLeft} />
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

      <AppModal
        visible={errorModal.visible}
        type={errorModal.type}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() => setErrorModal({ visible: false, type: 'error', title: '', message: '' })}
      />
    </Modal>
  );
};

export default ModalRoomDetails;
