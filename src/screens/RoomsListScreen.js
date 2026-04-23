import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { COLORS } from '../styles/colors';
import { roomsService } from '../services/rooms';
import { Button } from '../components/ui';

export default function RoomsListScreen({ navigation }) {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [selectedMateria, setSelectedMateria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMaterias, setLoadingMaterias] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const loadRooms = async () => {
    try {
      setError(null);
      const { data, error } = await roomsService.getRooms();
      if (error) {
        setError('No se pudieron cargar las salas');
      } else {
        setRooms(data || []);
        applyFilter(selectedMateria, data || []);
      }
    } catch (err) {
      setError('Ocurrió un error al cargar las salas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMaterias = async () => {
    try {
      const { data, error } = await roomsService.getMaterias();
      if (!error) {
        setMaterias(data || []);
      }
    } catch (err) {
      console.error('Error loading materias:', err);
    } finally {
      setLoadingMaterias(false);
    }
  };

  const applyFilter = (materiaId, roomsData) => {
    if (!materiaId) {
      setFilteredRooms(roomsData);
    } else {
      setFilteredRooms(roomsData.filter(room => room.materia_id === materiaId));
    }
  };

  const handleFilterPress = (materiaId) => {
    const newSelection = selectedMateria === materiaId ? null : materiaId;
    setSelectedMateria(newSelection);
    applyFilter(newSelection, rooms);
  };

  const handleDropdownSelect = (materiaId) => {
    setSelectedMateria(materiaId);
    applyFilter(materiaId, rooms);
    setDropdownOpen(false);
  };

  useEffect(() => {
    loadRooms();
    loadMaterias();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadRooms();
  };

  const renderRoom = ({ item }) => (
    <View style={styles.roomCard}>
      <Text style={styles.roomName}>{item.nombre}</Text>
      <View style={styles.roomInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Materia:</Text>
          <Text style={styles.infoValue}>{item.materia?.nombre || 'Sin materia'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Participantes:</Text>
          <Text style={styles.infoValue}>0/{item.capacidad_maxima}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Código:</Text>
          <Text style={styles.infoValue}>{item.codigo_invitacion}</Text>
        </View>
      </View>
      <Button
        title="Unirse a la sala"
        onPress={() => navigation.navigate('RoomCreated', { sala: item })}
        variant="outline"
      />
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No hay salas disponibles</Text>
      <Text style={styles.emptySubtext}>Crea una sala para empezar a estudiar</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Salas de Estudio</Text>
        <Button
          title="+ Crear Sala"
          onPress={() => navigation.navigate('CreateRoom')}
          style={styles.createButton}
        />
      </View>

      {/* Filtros de materias */}
      {!loadingMaterias && materias.length > 0 && (
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filtrar por materia:</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setDropdownOpen(!dropdownOpen)}
          >
            <Text style={styles.dropdownText}>
              {selectedMateria 
                ? materias.find(m => m.id === selectedMateria)?.nombre || 'Todas las materias'
                : 'Todas las materias'}
            </Text>
            <Text style={styles.dropdownArrow}>{dropdownOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          
          {dropdownOpen && (
            <View style={styles.dropdownList}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleDropdownSelect(null)}
              >
                <Text style={[styles.dropdownItemText, !selectedMateria && styles.dropdownItemSelected]}>
                  Todas las materias
                </Text>
              </TouchableOpacity>
              {materias.map((materia) => (
                <TouchableOpacity
                  key={materia.id}
                  style={styles.dropdownItem}
                  onPress={() => handleDropdownSelect(materia.id)}
                >
                  <Text style={[styles.dropdownItemText, selectedMateria === materia.id && styles.dropdownItemSelected]}>
                    {materia.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Reintentar"
            onPress={loadRooms}
            variant="outline"
          />
        </View>
      ) : (
        <FlatList
          data={filteredRooms}
          renderItem={renderRoom}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={filteredRooms.length === 0 && styles.emptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.card,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textWhite,
    marginBottom: 16,
  },
  createButton: {
    marginBottom: 0,
  },
  roomCard: {
    margin: 16,
    padding: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
  },
  roomName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textWhite,
    marginBottom: 12,
  },
  roomInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    color: COLORS.textLight,
    fontSize: 14,
  },
  infoValue: {
    color: COLORS.textWhite,
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  emptyList: {
    flex: 1,
  },
  filterContainer: {
    padding: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textWhite,
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    padding: 12,
  },
  dropdownText: {
    color: COLORS.textWhite,
    fontSize: 16,
  },
  dropdownArrow: {
    color: COLORS.primary,
    fontSize: 12,
  },
  dropdownList: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  dropdownItemText: {
    color: COLORS.textWhite,
    fontSize: 16,
  },
  dropdownItemSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});