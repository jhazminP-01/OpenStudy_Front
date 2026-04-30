import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING } from '../../styles';
import { roomsService } from '../../services/rooms';
import { supabase } from '../../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import ModalRoomDetails from '../../components/ui/ModalRoomDetails';
import { RoomCard, FilterChips, SearchBar, SectionHeader } from './components';
import styles from './RoomsListScreen.styles';

export default function RoomsListScreen({ navigation, route }) {
  const [rooms, setRooms] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [selectedMateria, setSelectedMateria] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [generalError, setGeneralError] = useState('');
  const [joiningRoomId, setJoiningRoomId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const { user } = useAuth();

  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const contentMaxWidth = isMobile ? '100%' : 460;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setGeneralError('');

      const [
        { data: materiasData, error: materiasError },
        { data: roomsData, error: roomsError },
      ] = await Promise.all([
        roomsService.getMaterias(),
        roomsService.getRooms(),
      ]);

      if (materiasError) {
        setGeneralError('No se pudieron cargar las materias');
        return;
      }

      if (roomsError) {
        setGeneralError('No se pudieron cargar las salas');
        return;
      }

      setMaterias(materiasData || []);
      setRooms(roomsData || []);
    } catch (error) {
      setGeneralError('Ocurrió un error al cargar las salas');
    } finally {
      setLoading(false);
    }
  }, []);

  let subscription = null;

  const setupRealtimeSubscription = () => {
    subscription = supabase
      .channel('participacion:all_rooms')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'participacion'
      }, (payload) => {
        updateRoomParticipantCount(payload);
      })
      .subscribe();
  };

  const updateRoomParticipantCount = (payload) => {
    if (!payload.new?.sala_id) {
      return;
    }
    
    const roomId = payload.new.sala_id;
    
    setRooms(prevRooms => {
      const updatedRooms = prevRooms.map(room => {
        if (room.id !== roomId) {
          return room;
        }
        
        let newParticipaciones = [...(room.participacion || [])];
        
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
            } else if (payload.new && !newParticipaciones.find(p => p.id === payload.new.id)) {
              newParticipaciones.push(payload.new);
            }
            break;
            
          case 'DELETE':
            newParticipaciones = newParticipaciones.filter(p => p.id !== payload.old.id);
            break;
        }
        
        return {
          ...room,
          participacion: newParticipaciones
        };
      });
      
      return updatedRooms;
    });
  };

  useEffect(() => {
    loadData();
    setupRealtimeSubscription();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [loadData]);

  useEffect(() => {
    if (route?.params?.refresh) {
      loadData();
      navigation.setParams?.({ refresh: undefined });
    }
  }, [route?.params?.refresh, loadData, navigation]);

  const filteredRooms = rooms.filter((room) => {
    const matchSearch = room.nombre
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchMateria =
      !selectedMateria || room.materia_id === selectedMateria;

    return matchSearch && matchMateria;
  });

  const handleViewDetails = (roomId) => {
    setSelectedRoomId(roomId);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedRoomId(null);
  };

  const handleJoinRoom = async (roomId) => {
    if (!user?.id) {
      Alert.alert('Error', 'Debes iniciar sesión para unirte a una sala');
      return;
    }

    setJoiningRoomId(roomId);
    const { data, error } = await roomsService.joinRoom(roomId, user.id);

    if (error) {
      if (error.message === 'Ya estás en esta sala') {
        navigation.navigate('Room', { roomId });
      } else {
        Alert.alert('Error', error.message);
      }
    } else {
      navigation.navigate('Room', { roomId });
    }
    setJoiningRoomId(null);
  };

  const getStatusInfo = (estado) => {
    if (estado === 'activa') {
      return {
        containerStyle: styles.statusActive,
        textStyle: styles.statusActiveText,
        label: 'Activa',
      };
    }

    return {
      containerStyle: styles.statusPaused,
      textStyle: styles.statusPausedText,
      label: estado || 'Estado',
    };
  };

  const getCardTheme = (materiaNombre) => {
    const name = (materiaNombre || '').toLowerCase();

    if (name.includes('program')) {
      return {
        icon: 'code-slash-outline',
        iconBoxStyle: styles.iconProgramming,
        buttonStyle: styles.buttonPurple,
        color: COLORS.subjects.programacion,
      };
    }

    if (name.includes('mat')) {
      return {
        icon: 'calculator-outline',
        iconBoxStyle: styles.iconMath,
        buttonStyle: styles.buttonGreen,
        color: COLORS.subjects.matematicas,
      };
    }

    if (name.includes('fis')) {
      return {
        icon: 'planet-outline',
        iconBoxStyle: styles.iconPhysics,
        buttonStyle: styles.buttonBlue,
        color: COLORS.subjects.fisica,
      };
    }

    if (
      name.includes('idioma') ||
      name.includes('inglés') ||
      name.includes('ingles')
    ) {
      return {
        icon: 'chatbubble-ellipses-outline',
        iconBoxStyle: styles.iconLanguage,
        buttonStyle: styles.buttonPink,
        color: COLORS.subjects.ingles,
      };
    }

    return {
      icon: 'sparkles-outline',
      iconBoxStyle: styles.iconDefault,
      buttonStyle: styles.buttonPurple,
      color: COLORS.subjects.baseDatos,
    };
  };

  const renderRoom = ({ item }) => {
    const participantsCount = item.participacion?.filter(
      p => p.estado_conexion === 'activo' && !p.esta_expulsado
    ).length || 0;
    const statusInfo = getStatusInfo(item.estado);
    const theme = getCardTheme(item.materia?.nombre);
    const isJoining = joiningRoomId === item.id;
    const isFull = participantsCount >= item.capacidad_maxima;

    return (
      <RoomCard
        room={item}
        participantsCount={participantsCount}
        statusInfo={statusInfo}
        theme={theme}
        isJoining={isJoining}
        isFull={isFull}
        onViewDetails={() => handleViewDetails(item.id)}
        onJoin={() => handleJoinRoom(item.id)}
      />
    );
  };

  return (
    <LinearGradient
      colors={COLORS.gradientRooms}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.screenCenter}>
        <FlatList
          style={[styles.listWrapper, { maxWidth: contentMaxWidth }]}
          data={filteredRooms}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderRoom}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              <View style={styles.header}>
                <View style={styles.headerTextBox}>
                  <Text style={styles.title}>Salas de Estudio</Text>
                  <Text style={styles.subtitle}>
                    Encuentra tu espacio para aprender y colaborar
                  </Text>
                </View>

                <TouchableOpacity style={styles.notificationButton}>
                  <Ionicons name="notifications" size={22} color={COLORS.iconCode} />
                  <View style={styles.notificationDot} />
                </TouchableOpacity>
              </View>

              <SearchBar
                value={search}
                onChangeText={setSearch}
              />

              <FilterChips
                materias={materias}
                selectedMateria={selectedMateria}
                onSelectMateria={setSelectedMateria}
              />

              <SectionHeader count={filteredRooms.length} />

              {loading ? (
                <ActivityIndicator
                  size="large"
                  color={COLORS.activityIndicator}
                  style={{ marginTop: 30, marginBottom: 20 }}
                />
              ) : null}

              {!loading && generalError ? (
                <Text style={styles.errorText}>{generalError}</Text>
              ) : null}

              {!loading && !generalError && filteredRooms.length === 0 ? (
                <Text style={styles.emptyText}>
                  No hay salas disponibles por ahora
                </Text>
              ) : null}
            </>
          }
          ListFooterComponent={<View style={{ height: 110 }} />}
        />
      </View>

      <TouchableOpacity
        style={styles.createRoomButtonWrapper}
        onPress={() => navigation.navigate('CreateRoom')}
      >
        <LinearGradient
          colors={COLORS.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.createRoomButton}
        >
          <Text style={styles.createRoomButtonText}>+ Crear sala</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Modal de detalles */}
      <ModalRoomDetails
        visible={modalVisible}
        roomId={selectedRoomId}
        onClose={handleCloseModal}
      />
    </LinearGradient>
  );
}
