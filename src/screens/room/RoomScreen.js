import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles';
import { roomsService } from '../../services/rooms';
import { supabase } from '../../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import ParticipantsScreen from './ParticipantsScreen';
import ConfirmModal from '../../components/ui/ConfirmModal';

const RoomScreen = ({ route, navigation }) => {
  const { roomId } = route.params;
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [activeTab, setActiveTab] = useState('room'); // 'room', 'chat', 'participants'
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadRoomDetails();
    setupRealtimeSubscription();

    return () => {
      // Cleanup subscription when component unmounts
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [roomId]);

  let subscription = null;

  const setupRealtimeSubscription = () => {
    subscription = supabase
      .channel(`participacion:sala_id=eq.${roomId}`)
      .on('postgres_changes', {
        event: '*', // Listen to INSERT, UPDATE, DELETE
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
          // Add new participant
          if (payload.new && !newParticipaciones.find(p => p.id === payload.new.id)) {
            newParticipaciones.push(payload.new);
          }
          break;
          
        case 'UPDATE':
          // Update existing participant
          const index = newParticipaciones.findIndex(p => p.id === payload.new.id);
          if (index !== -1 && payload.new) {
            newParticipaciones[index] = payload.new;
          }
          break;
          
        case 'DELETE':
          // Remove participant
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

  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeaveRoom = () => {
    if (isLeaving || leaving) {
      return;
    }

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
      case 'chat':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.placeholderTextCenter}>
              El chat en tiempo real estará disponible en la próxima actualización (HU-07).
            </Text>
          </View>
        );
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={26} color={COLORS.textWhite} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            handleLeaveRoom();
          }}
          disabled={leaving}
        >
          {leaving ? (
            <ActivityIndicator color={COLORS.textWhite} size="small" />
          ) : (
            <Ionicons name="exit-outline" size={22} color={COLORS.error} />
          )}
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.contentContainer}>
        {renderTabContent()}
      </View>

      {/* Manual Tabs - Abajo */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'room' && styles.tabItemActive]}
          onPress={() => setActiveTab('room')}
        >
          <Ionicons
            name={activeTab === 'room' ? 'home' : 'home-outline'}
            size={22}
            color={activeTab === 'room' ? COLORS.textWhite : COLORS.textRoomsTertiary}
          />
          <Text style={[styles.tabLabel, activeTab === 'room' && styles.tabLabelActive]}>
            Sala
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'chat' && styles.tabItemActive]}
          onPress={() => setActiveTab('chat')}
        >
          <Ionicons
            name={activeTab === 'chat' ? 'chatbubbles' : 'chatbubbles-outline'}
            size={22}
            color={activeTab === 'chat' ? COLORS.textWhite : COLORS.textRoomsTertiary}
          />
          <Text style={[styles.tabLabel, activeTab === 'chat' && styles.tabLabelActive]}>
            Chat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'participants' && styles.tabItemActive]}
          onPress={() => setActiveTab('participants')}
        >
          <Ionicons
            name={activeTab === 'participants' ? 'people' : 'people-outline'}
            size={22}
            color={activeTab === 'participants' ? COLORS.textWhite : COLORS.textRoomsTertiary}
          />
          <Text style={[styles.tabLabel, activeTab === 'participants' && styles.tabLabelActive]}>
            Persona
          </Text>
        </TouchableOpacity>
      </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.rooms.paddingX,
    paddingTop: SPACING.rooms.paddingTop,
    paddingBottom: SPACING.md,
    backgroundColor: 'rgba(7, 0, 22, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },

  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },

  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: SPACING.borderRadius['2xl'],
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
    shadowColor: COLORS.shadowRooms,
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.borderRadius.md,
  },

  tabItemActive: {
    backgroundColor: COLORS.backgroundRoomsMedium,
  },

  tabLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textRoomsTertiary,
    marginTop: 2,
  },

  tabLabelActive: {
    color: COLORS.textWhite,
  },

  contentContainer: {
    flex: 1,
  },

  tabContent: {
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

  placeholderTextCenter: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: SPACING.rooms.marginBottomLarge,
  },

  errorText: {
    fontSize: 16,
    color: COLORS.textRoomsError,
  },
});

export default RoomScreen;
