import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../../styles';
import { roomsService } from '../../../services/rooms';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../hooks/useAuth';
import ParticipantsScreen from '../ParticipantsScreen';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { RoomHeader, RoomTabBar, RoomInfoTab, ChatTab } from './components';
import styles from './RoomScreen.styles';

const RoomScreen = ({ route, navigation }) => {
  const { roomId } = route.params;
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [activeTab, setActiveTab] = useState('room'); // 'room', 'chat', 'participants'
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const { user } = useAuth();

  let subscription = null;

  useEffect(() => {
    loadRoomDetails();
    setupRealtimeSubscription();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [roomId]);

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'room':
        return (
          <RoomInfoTab
            roomData={roomData}
            participantsCount={participantsCount}
          />
        );
      case 'chat':
        return <ChatTab />;
      case 'participants':
        return <ParticipantsScreen route={{ params: { roomId } }} />;
      default:
        return null;
    }
  };

  return (
    <LinearGradient
      colors={COLORS.gradientRooms}
      style={styles.container}
    >
      {/* Header */}
      <RoomHeader
        onBack={() => navigation.goBack()}
        onLeave={handleLeaveRoom}
        leaving={leaving}
      />

      {/* Tab Content */}
      <View style={styles.contentContainer}>
        {renderTabContent()}
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
    </LinearGradient>
  );
};

export default RoomScreen;
