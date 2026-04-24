import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { roomsService } from '../services/rooms';
import { Ionicons } from '@expo/vector-icons';

export default function RoomsListScreen({ navigation, route }) {
  const [rooms, setRooms] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [selectedMateria, setSelectedMateria] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [generalError, setGeneralError] = useState('');

  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isSmallMobile = width < 400;
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

  useEffect(() => {
    loadData();
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
        icon: '</>',
        iconBoxStyle: styles.iconProgramming,
        buttonStyle: styles.buttonPurple,
      };
    }

    if (name.includes('mat')) {
      return {
        icon: '∑',
        iconBoxStyle: styles.iconMath,
        buttonStyle: styles.buttonGreen,
      };
    }

    if (name.includes('fis')) {
      return {
        icon: '⚛',
        iconBoxStyle: styles.iconPhysics,
        buttonStyle: styles.buttonBlue,
      };
    }

    if (
      name.includes('idioma') ||
      name.includes('inglés') ||
      name.includes('ingles')
    ) {
      return {
        icon: 'Aa',
        iconBoxStyle: styles.iconLanguage,
        buttonStyle: styles.buttonPink,
      };
    }

    return {
      icon: '✦',
      iconBoxStyle: styles.iconDefault,
      buttonStyle: styles.buttonPurple,
    };
  };

  const renderRoom = ({ item }) => {
  const participantsCount = item.participacion?.length || 0;
  const statusInfo = getStatusInfo(item.estado);
  const theme = getCardTheme(item.materia?.nombre);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View style={[styles.iconBox, theme.iconBoxStyle]}>
          <Text style={styles.iconText}>{theme.icon}</Text>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardTopRow}>
            <Text style={styles.categoryBadge}>
              {item.materia?.nombre?.toUpperCase() || 'MATERIA'}
            </Text>

            <View style={[styles.statusBadge, statusInfo.containerStyle]}>
              <Text style={[styles.statusText, statusInfo.textStyle]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>

          <Text style={styles.roomTitle}>{item.nombre}</Text>

          {!!item.descripcion && (
            <Text style={styles.roomDescription} numberOfLines={2}>
              {item.descripcion}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="people-outline" size={16} color="#C4B5FD" />
          <Text style={styles.infoText}>
            {participantsCount}/{item.capacidad_maxima} participantes
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="key-outline" size={16} color="#FACC15" />
          <Text style={styles.infoText}>{item.codigo_invitacion}</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.enterButton, theme.buttonStyle]}>
        <Text style={styles.enterButtonText}>Entrar →</Text>
      </TouchableOpacity>
    </View>
  );
};

return (
  <LinearGradient
    colors={['#4B1387', '#170531', '#070016']}
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
                <Ionicons name="notifications" size={22} color="#FACC15" />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Buscar salas de estudio..."
              placeholderTextColor="#8D74B8"
              value={search}
              onChangeText={setSearch}
            />

            <FlatList
              data={[{ id: 'all', nombre: 'Todas' }, ...materias]}
              keyExtractor={(item) => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersContainer}
              renderItem={({ item }) => {
                const isSelected =
                  item.id === 'all'
                    ? selectedMateria === null
                    : selectedMateria === item.id;

                return (
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      isSelected && styles.filterChipSelected,
                    ]}
                    onPress={() =>
                      setSelectedMateria(item.id === 'all' ? null : item.id)
                    }
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        isSelected && styles.filterChipTextSelected,
                      ]}
                    >
                      {item.nombre}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />

            <View style={styles.sectionHeader}>
              <View style={styles.sectionLeft}>
                <View style={styles.sectionIconContainer}>
                  <Ionicons name="people" size={18} color="#C4B5FD" />
                </View>
                <Text style={styles.sectionTitle}>Salas disponibles</Text>
              </View>

              <Text style={styles.sectionCount}>
                {filteredRooms.length} salas activas
              </Text>
            </View>

            {loading ? (
              <ActivityIndicator
                size="large"
                color="#C86CFF"
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
        colors={['#C86CFF', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.createRoomButton}
      >
        <Text style={styles.createRoomButtonText}>＋ Crear sala</Text>
      </LinearGradient>
    </TouchableOpacity>
  </LinearGradient>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  screenCenter: {
    flex: 1,
    alignItems: 'center',
  },

  listWrapper: {
    width: '100%',
  },

  listContent: {
    paddingTop: 22,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
    gap: 12,
  },

  headerTextBox: {
    flex: 1,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    flexShrink: 1,
  },

  subtitle: {
    fontSize: 15,
    color: '#D5C4F4',
    flexShrink: 1,
    lineHeight: 20,
  },

  notificationButton: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  notificationIcon: {
    fontSize: 22,
  },

  notificationDot: {
    position: 'absolute',
    top: 11,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5FA2',
  },

  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 15,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },

  filtersContainer: {
    paddingBottom: 18,
  },

  filterChip: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 22,
    marginRight: 10,
  },

  filterChipSelected: {
    backgroundColor: '#A855F7',
    borderColor: '#A855F7',
  },

  filterChipText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },

  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },

  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  sectionIcon: {
    fontSize: 18,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flexShrink: 1,
  },

  sectionCount: {
    fontSize: 14,
    color: '#B97EFF',
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },

  card: {
    backgroundColor: 'rgba(22, 10, 56, 0.84)',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },

  cardHeaderRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },

  iconBox: {
    width: 78,
    height: 78,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  iconProgramming: {
    backgroundColor: 'rgba(168, 85, 247, 0.25)',
  },

  iconMath: {
    backgroundColor: 'rgba(52, 211, 153, 0.18)',
  },

  iconPhysics: {
    backgroundColor: 'rgba(79, 125, 243, 0.18)',
  },

  iconLanguage: {
    backgroundColor: 'rgba(244, 92, 163, 0.18)',
  },

  iconDefault: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  iconText: {
    fontSize: 28,
    color: '#D39BFF',
    fontWeight: '700',
  },

  cardContent: {
    flex: 1,
  },

  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
    gap: 8,
  },

  categoryBadge: {
    backgroundColor: 'rgba(168, 85, 247, 0.18)',
    color: '#C483FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
    flexShrink: 1,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },

  statusActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
  },

  statusPaused: {
    backgroundColor: 'rgba(245, 158, 11, 0.16)',
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },

  statusActiveText: {
    color: '#5EF2B0',
  },

  statusPausedText: {
    color: '#FFBF47',
  },

  roomTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },

  roomDescription: {
    fontSize: 14,
    color: '#D0C2EF',
    lineHeight: 21,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingTop: 4,
    gap: 10,
    flexWrap: 'wrap',
  },

  infoText: {
    fontSize: 14,
    color: '#D0C2EF',
    flexShrink: 1,
  },

  enterButton: {
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },

  buttonPurple: {
    backgroundColor: '#8B5CF6',
  },

  buttonGreen: {
    backgroundColor: '#1FA46F',
  },

  buttonBlue: {
    backgroundColor: '#4F7DF3',
  },

  buttonPink: {
    backgroundColor: '#D94D91',
  },

  enterButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  createRoomButtonWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 84,
    zIndex: 100,
  },

  createRoomButton: {
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C084FC',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  createRoomButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  errorText: {
    color: '#FFB3C8',
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 18,
  },

  emptyText: {
    color: '#D5C4F4',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    fontSize: 15,
  },
});