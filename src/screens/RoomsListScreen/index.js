import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING } from '../../styles';
import { roomsService } from '../../services/rooms';
import { supabase } from '../../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import ModalRoomDetails from '../../components/ui/ModalRoomDetails';
import AppModal from '../../components/ui/ErrorModal';
import { RoomCard, FilterChips, SearchBar, SectionHeader } from './components';
import AdvancedFilters from '../../components/ui/AdvancedFilters';
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
  const [errorModal, setErrorModal] = useState({ visible: false, type: 'error', title: '', message: '' });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    fase: [],
    capacidad: [],
    ordenar: 'default',
  });
  const { user } = useAuth();

  // Al llegar a la lista de salas, limpiar cualquier sesión activa stale
  // (por si se recargó/cerró la app estando en una sala)
  useEffect(() => {
    const cleanupStaleSessions = async () => {
      if (!user?.id) return;

      try {
        // Marcar todas las participaciones activas del usuario como inactivas en una sola query
        await supabase
          .from('participacion')
          .update({ estado_conexion: 'inactivo' })
          .eq('usuario_id', user.id)
          .eq('estado_conexion', 'activo')
          .eq('esta_expulsado', false);
      } catch (error) {
        // Silencioso - no afecta UX si falla
      }
    };

    cleanupStaleSessions();
  }, [user?.id]);

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
  let roomStatusSubscription = null;
  let timerSubscription = null;

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

    // Escuchar cambios en el estado de las salas y nuevas salas
    roomStatusSubscription = supabase
      .channel('sala:estado')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'sala'
      }, (payload) => {
        handleNewRoom(payload);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'sala'
      }, (payload) => {
        handleRoomStatusChange(payload);
      })
      .subscribe();

    // Escuchar cambios en el timer de las salas (fase, estado)
    timerSubscription = supabase
      .channel('pomodoro_estado:rooms')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pomodoro_estado'
      }, (payload) => {
        handleTimerChange(payload);
      })
      .subscribe();
  };

  const handleRoomStatusChange = (payload) => {
    const { id, estado } = payload.new;

    // Si una sala cambió a inactiva, removerla de la lista
    if (estado === 'inactiva') {
      setRooms(prevRooms => prevRooms.filter(room => room.id !== id));
    }
    // Si una sala cambió a activa, recargar la lista
    else if (estado === 'activa') {
      loadData();
    }
  };

  const handleTimerChange = (payload) => {
    const { sala_id, fase, estado } = payload.new || payload.old;

    setRooms(prevRooms => {
      return prevRooms.map(room => {
        if (room.id === sala_id) {
          return {
            ...room,
            pomodoro_estado: {
              fase,
              estado,
            },
          };
        }
        return room;
      });
    });
  };

  const handleNewRoom = async (payload) => {
    const newRoom = payload.new;
    
    // Solo agregar si está activa
    if (newRoom.estado === 'activa') {
      // Obtener datos completos de la sala (con materia y participación)
      const { data, error } = await roomsService.getRoomDetails(newRoom.id);
      
      if (!error && data) {
        setRooms(prevRooms => [data, ...prevRooms]);
      }
    }
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
      if (roomStatusSubscription) {
        supabase.removeChannel(roomStatusSubscription);
      }
      if (timerSubscription) {
        supabase.removeChannel(timerSubscription);
      }
    };
  }, [loadData]);

  useEffect(() => {
    if (route?.params?.refresh) {
      loadData();
      navigation.setParams?.({ refresh: undefined });
    }
  }, [route?.params?.refresh, loadData, navigation]);

  const filteredRooms = (rooms || [])
    .filter((room) => {
      const matchSearch = room.nombre
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchMateria =
        !selectedMateria || room.materia_id === selectedMateria;

      // Filtro por fase del timer
      const matchFase =
        advancedFilters.fase.length === 0 ||
        advancedFilters.fase.includes(room.pomodoro_estado?.fase);

      // Filtro por capacidad
      const participantsCount = room.participacion?.filter(
        p => p.estado_conexion === 'activo' && !p.esta_expulsado
      ).length || 0;
      const isFull = participantsCount >= room.capacidad_maxima;

      let matchCapacidad = true;
      if (advancedFilters.capacidad.length > 0) {
        if (advancedFilters.capacidad.includes('conEspacio') && isFull) {
          matchCapacidad = false;
        }
        if (advancedFilters.capacidad.includes('llenas') && !isFull) {
          matchCapacidad = false;
        }
      }

      return matchSearch && matchMateria && matchFase && matchCapacidad;
    })
    .sort((a, b) => {
      const aParticipants = a.participacion?.filter(
        p => p.estado_conexion === 'activo' && !p.esta_expulsado
      ).length || 0;
      const bParticipants = b.participacion?.filter(
        p => p.estado_conexion === 'activo' && !p.esta_expulsado
      ).length || 0;

      switch (advancedFilters.ordenar) {
        case 'participantes':
          return bParticipants - aParticipants;
        case 'menosParticipantes':
          return aParticipants - bParticipants;
        case 'recientes':
          return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
        default:
          return 0;
      }
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
      setErrorModal({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'Debes iniciar sesión para unirte a una sala'
      });
      return;
    }

    setJoiningRoomId(roomId);
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
    const name = (materiaNombre || '').toLowerCase().trim();

    if (name === 'programación' || name === 'programacion') {
      return {
        icon: 'code-slash-outline',
        iconBoxStyle: styles.iconProgramming,
        buttonStyle: styles.buttonPurple,
        color: COLORS.subjects.programacion,
      };
    }

    if (name === 'matemáticas' || name === 'matematicas') {
      return {
        icon: 'calculator-outline',
        iconBoxStyle: styles.iconMath,
        buttonStyle: styles.buttonGreen,
        color: COLORS.subjects.matematicas,
      };
    }

    if (name === 'física' || name === 'fisica') {
      return {
        icon: 'planet-outline',
        iconBoxStyle: styles.iconPhysics,
        buttonStyle: styles.buttonBlue,
        color: COLORS.subjects.fisica,
      };
    }

    if (name === 'inglés' || name === 'ingles' || name === 'idioma') {
      return {
        icon: 'chatbubble-ellipses-outline',
        iconBoxStyle: styles.iconLanguage,
        buttonStyle: styles.buttonPink,
        color: COLORS.subjects.ingles,
      };
    }

    if (name === 'química' || name === 'quimica') {
      return {
        icon: 'flask-outline',
        iconBoxStyle: styles.iconChemistry,
        buttonStyle: styles.buttonOrange,
        color: COLORS.subjects.quimica,
      };
    }

    if (name === 'historia') {
      return {
        icon: 'book-outline',
        iconBoxStyle: styles.iconHistory,
        buttonStyle: styles.buttonBrown,
        color: COLORS.subjects.historia,
      };
    }

    if (name === 'biología' || name === 'biologia') {
      return {
        icon: 'leaf-outline',
        iconBoxStyle: styles.iconBiology,
        buttonStyle: styles.buttonGreen,
        color: COLORS.subjects.biologia,
      };
    }

    if (name === 'economía' || name === 'economia') {
      return {
        icon: 'trending-up-outline',
        iconBoxStyle: styles.iconEconomics,
        buttonStyle: styles.buttonYellow,
        color: COLORS.subjects.economia,
      };
    }

    if (name === 'base de datos' || name === 'base de datos') {
      return {
        icon: 'server-outline',
        iconBoxStyle: styles.iconDatabase,
        buttonStyle: styles.buttonPurple,
        color: COLORS.subjects.baseDatos,
      };
    }

    if (name === 'otros') {
      return {
        icon: 'sparkles-outline',
        iconBoxStyle: styles.iconDefault,
        buttonStyle: styles.buttonGray,
        color: COLORS.subjects.otros,
      };
    }

    return {
      icon: 'sparkles-outline',
      iconBoxStyle: styles.iconDefault,
      buttonStyle: styles.buttonGray,
      color: COLORS.subjects.otros,
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
    const timerPhase = item.pomodoro_estado?.fase;

    return (
      <RoomCard
        room={item}
        participantsCount={participantsCount}
        statusInfo={statusInfo}
        theme={theme}
        isJoining={isJoining}
        isFull={isFull}
        timerPhase={timerPhase}
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
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: SPACING.md, alignItems: 'center', marginBottom: SPACING.rooms.marginBottomMedium, width: '100%' }}>
                <View style={{ flex: 1 }}>
                  <SearchBar
                    value={search}
                    onChangeText={setSearch}
                  />
                </View>
                <TouchableOpacity
                  style={styles.advancedFilterButton}
                  onPress={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <Ionicons name="funnel" size={20} color={COLORS.textWhite} />
                </TouchableOpacity>
              </View>

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
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={COLORS.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.createRoomButton}
        >
          <Ionicons name="add" size={32} color={COLORS.textWhite} />
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.joinByCodeButtonWrapper}
        onPress={() => navigation.navigate('JoinByCode')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#FACC15', '#EAB308']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.joinByCodeButton}
        >
          <Ionicons name="key-outline" size={28} color={COLORS.textWhite} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Modal de detalles */}
      <ModalRoomDetails
        visible={modalVisible}
        roomId={selectedRoomId}
        onClose={handleCloseModal}
        navigation={navigation}
      />

      {/* Modal de error */}
      <AppModal
        visible={errorModal.visible}
        type={errorModal.type}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() => setErrorModal({ visible: false, type: 'error', title: '', message: '' })}
      />

      {/* Modal de Filtros Avanzados */}
      <Modal
        visible={showAdvancedFilters}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowAdvancedFilters(false)}
      >
        <LinearGradient
          colors={COLORS.gradientRooms}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, paddingTop: 60, paddingHorizontal: SPACING.md }}
        >
          <AdvancedFilters
            visible={showAdvancedFilters}
            onToggle={() => setShowAdvancedFilters(false)}
            onApply={(filters) => {
              setAdvancedFilters(filters);
              setShowAdvancedFilters(false);
            }}
            onClear={() => {
              setAdvancedFilters({
                estado: [],
                capacidad: [],
                ordenar: 'default',
              });
            }}
            filters={advancedFilters}
          />
        </LinearGradient>
      </Modal>
    </LinearGradient>
  );
}
