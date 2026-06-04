import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../../styles';
import { roomsService } from '../../../services/rooms';
import { reportsService } from '../../../services/reports';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../hooks/useAuth';
import ParticipantsScreen from '../ParticipantsScreen';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import InAppNotification from '../../../components/ui/InAppNotification';
import ModerationPanel from '../../../components/moderation/ModerationPanel';
import { RoomHeader, RoomTabBar, RoomInfoTab, ChatTab } from './components';
import { ambientSoundControl } from '../../../utils/ambientSoundControl';
import styles from './RoomScreen.styles';

const RoomScreen = ({ route, navigation }) => {
  const { roomId } = route.params;
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [activeTab, setActiveTab] = useState('room'); // 'room', 'chat', 'participants'
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showModerationPanel, setShowModerationPanel] = useState(false);
  const [pendingReports, setPendingReports] = useState(0);
  const [modNotification, setModNotification] = useState({ visible: false, variant: 'warning', title: '', message: '' });
  const { user } = useAuth();
  const reportsChannelRef = useRef(null);

  let subscription = null;

  // Navegar a sonidos cuando se selecciona el tab - DEBE estar antes de returns condicionales
  useEffect(() => {
    if (activeTab === 'sounds') {
      navigation.navigate('RoomSounds');
      setActiveTab('room');
    }
  }, [activeTab, navigation]);

  // Pausar sonido al ir a sonidos (SoundsScreen maneja el resume al volver)
  useEffect(() => {
    if (activeTab === 'sounds') {
      ambientSoundControl.pause();
    }
  }, [activeTab]);

  useEffect(() => {
    loadRoomDetails();
    setupRealtimeSubscription();

    return () => {
      // Salir de la sala automáticamente al desmontar (navegación normal)
      if (user?.id) {
        roomsService.leaveRoom(roomId, user.id);
      }

      if (subscription) {
        supabase.removeChannel(subscription);
      }

      if (reportsChannelRef.current) {
        reportsChannelRef.current.unsubscribe();
        reportsChannelRef.current = null;
      }
    };
  }, [roomId, user?.id]);

  // Escuchar advertencias/expulsiones en la propia participación
  const prevAdvertenciasRef = useRef(null);

  useEffect(() => {
    if (!user?.id || !roomId) return;

    const moderationChannel = supabase
      .channel(`participacion-mod-${roomId}-${user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'participacion',
        filter: `sala_id=eq.${roomId}`,
      }, (payload) => {
        const row = payload.new;
        if (row.usuario_id !== user.id) return;

        // Expulsado
        if (row.esta_expulsado) {
          setModNotification({
            visible: true,
            variant: 'error',
            title: 'Has sido expulsado',
            message: 'No puedes reingresar a esta sala.',
          });
          setTimeout(() => navigation.goBack(), 3500);
          return;
        }

        // Advertencia nueva
        if (row.advertencias > 0 && row.advertencias !== prevAdvertenciasRef.current) {
          prevAdvertenciasRef.current = row.advertencias;
          const extra = row.advertencias === 2 ? ' — Una más y serás expulsado.' : '';
          setModNotification({
            visible: true,
            variant: 'warning',
            title: 'Has recibido una advertencia',
            message: `Advertencias: ${row.advertencias}/3${extra}`,
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(moderationChannel);
    };
  }, [roomId, user?.id, navigation]);

  // Cargar reportes pendientes y suscribirse (solo moderador)
  useEffect(() => {
    if (!roomData || !user?.id) return;

    const currentParticipation = roomData.participacion?.find(
      (p) => p.usuario_id === user.id
    );
    const isMod = currentParticipation?.rol === 'moderador';
    if (!isMod) return;

    const loadPendingCount = async () => {
      const { data } = await reportsService.getReports(roomId);
      setPendingReports(data?.length || 0);
    };

    loadPendingCount();

    reportsChannelRef.current = supabase
      .channel(`reportes-sala-${roomId}-badge`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'reporte',
      }, (payload) => {
        if (payload.new.sala_id === roomId) {
          setPendingReports((prev) => prev + 1);
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'reporte',
      }, (payload) => {
        if (payload.new.sala_id === roomId && payload.new.estado !== 'pendiente') {
          setPendingReports((prev) => Math.max(0, prev - 1));
        }
      })
      .subscribe();

    return () => {
      if (reportsChannelRef.current) {
        supabase.removeChannel(reportsChannelRef.current);
        reportsChannelRef.current = null;
      }
    };
  }, [roomData, user?.id, roomId]);

  const setupRealtimeSubscription = () => {
    subscription = supabase
      .channel(`participacion:sala_id=eq.${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'participacion',
        filter: `sala_id=eq.${roomId}`
      }, (payload) => {
        updateParticipantsLocally(payload);
      })
      .subscribe();
  };

  const updateParticipantsLocally = (payload) => {
    setRoomData(prev => {
      if (!prev) return prev;
      
      let newParticipaciones = [...(prev.participacion || [])];
      
      switch (payload.eventType) {
        case 'INSERT':
          if (payload.new && !newParticipaciones.find(p => p.id === payload.new.id)) {
            newParticipaciones.push(payload.new);
          }
          break;
          
        case 'UPDATE':
          const index = newParticipaciones.findIndex(p => p.id === payload.new.id);
          if (index !== -1 && payload.new) {
            newParticipaciones[index] = payload.new;
          }
          break;
          
        case 'DELETE':
          newParticipaciones = newParticipaciones.filter(p => p.id !== payload.old.id);
          break;
      }
      
      return {
        ...prev,
        participacion: newParticipaciones
      };
    });
  };

  const loadRoomDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await roomsService.getRoomDetails(roomId);

      if (error) {
        Alert.alert('Error', 'No se pudo cargar la sala');
        navigation.goBack();
        return;
      }

      setRoomData(data);
    } catch (error) {
      // TODO: Reemplazar con modal personalizado si es necesario
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = () => {
    if (leaving) return;
    setShowLeaveModal(true);
  };

  const confirmLeaveRoom = async () => {
    if (!user?.id) {
      setShowLeaveModal(false);
      return;
    }

    setLeaving(true);
    const { data, error } = await roomsService.leaveRoom(roomId, user.id);

    if (error) {
      setLeaving(false);
      setShowLeaveModal(false);
    } else {
      navigation.goBack();
    }
  };

  const cancelLeaveRoom = () => {
    setShowLeaveModal(false);
  };

  if (loading) {
    return (
      <LinearGradient
        colors={COLORS.gradientRooms}
        style={styles.container}
      >
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.textWhite} />
        </View>
      </LinearGradient>
    );
  }

  if (!roomData) {
    return (
      <LinearGradient
        colors={COLORS.gradientRooms}
        style={styles.container}
      >
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>No se encontró la sala</Text>
        </View>
      </LinearGradient>
    );
  }

  const participantsCount = roomData.participacion?.filter(
    p => p.estado_conexion === 'activo' && !p.esta_expulsado
  ).length || 0;

  // Obtener advertencias del usuario actual
  const userParticipation = roomData.participacion?.find(
    p => p.usuario_id === user?.id
  );
  const userWarnings = userParticipation?.advertencias || 0;

  const currentParticipation = roomData.participacion?.find(
    (p) => p.usuario_id === user?.id
  );
  const isModerator = currentParticipation?.rol === 'moderador';

  return (
    <LinearGradient
      colors={COLORS.gradientRooms}
      style={styles.container}
    >
      {/* Header */}
      <RoomHeader
        roomName={roomData?.nombre || 'Sala'}
        onLeave={handleLeaveRoom}
        leaving={leaving}
        userWarnings={userWarnings}
      />

      {/* Tabs siempre montados para mantener useTimer activo entre tabs */}
      <View style={[styles.contentContainer, activeTab !== 'room' && { display: 'none' }]}>
        <RoomInfoTab
          roomData={roomData}
          participantsCount={participantsCount}
          roomId={roomId}
          onOpenModeration={() => setShowModerationPanel(true)}
          pendingReports={pendingReports}
        />
      </View>
      <View style={[styles.contentContainer, activeTab !== 'chat' && { display: 'none' }]}>
        <ChatTab roomId={roomId} />
      </View>
      <View style={[styles.contentContainer, activeTab !== 'participants' && { display: 'none' }]}>
        <ParticipantsScreen route={{ params: { roomId } }} />
      </View>

      {/* Tab Bar */}
      <RoomTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <ConfirmModal
        visible={showLeaveModal}
        title="Salir de la sala"
        message="¿Estás seguro de que quieres salir de esta sala?"
        confirmText="Salir"
        cancelText="Cancelar"
        onConfirm={confirmLeaveRoom}
        onCancel={cancelLeaveRoom}
        loading={leaving}
        icon="exit-outline"
        iconColor={COLORS.error}
      />

      <ModerationPanel
        visible={showModerationPanel}
        onClose={() => {
          setShowModerationPanel(false);
          // Recargar contador al cerrar
          reportsService.getReports(roomId).then(({ data }) => {
            setPendingReports(data?.length || 0);
          });
        }}
        salaId={roomId}
      />

      <InAppNotification
        visible={modNotification.visible}
        variant={modNotification.variant}
        title={modNotification.title}
        message={modNotification.message}
        duration={modNotification.variant === 'error' ? 3500 : 5000}
        onDismiss={() => setModNotification((prev) => ({ ...prev, visible: false }))}
      />
    </LinearGradient>
  );
};

export default RoomScreen;
