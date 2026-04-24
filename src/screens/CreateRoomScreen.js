import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { supabase } from '../../lib/supabase';
import { roomsService } from '../services/rooms';
import { validateCreateRoom } from '../utils/roomValidators';

export default function CreateRoomScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [materiaId, setMateriaId] = useState(null);
  const [capacidadMaxima, setCapacidadMaxima] = useState('');
  const [materias, setMaterias] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingMaterias, setLoadingMaterias] = useState(true);
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    loadMaterias();
  }, []);

  const loadMaterias = async () => {
    try {
      setLoadingMaterias(true);
      const { data, error } = await roomsService.getMaterias();

      if (error) {
        setGeneralError('No se pudieron cargar las materias');
        return;
      }

      setMaterias(data || []);
    } catch {
      setGeneralError('Ocurrió un error al cargar las materias');
    } finally {
      setLoadingMaterias(false);
    }
  };

  const handleCreateRoom = async () => {
    setGeneralError('');

    const validationErrors = validateCreateRoom({
      nombre,
      materia_id: materiaId,
      capacidad_maxima: capacidadMaxima,
    });

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setGeneralError('No se encontró un usuario autenticado');
        return;
      }

      const roomData = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        materia_id: materiaId,
        capacidad_maxima: Number(capacidadMaxima),
      };

      const { data, error } = await roomsService.createRoom(roomData, user.id);

      if (error) {
        setGeneralError(error.message || 'No se pudo crear la sala');
        return;
      }

      const materiaSeleccionada = materias.find((item) => item.id === materiaId);

      navigation.navigate('RoomCreated', {
        sala: data,
        materiaNombre: materiaSeleccionada?.nombre,
      });
    } catch (err) {
      console.log('Error inesperado al crear sala:', err);
      setGeneralError('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#4B1387', '#170531', '#070016']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.title}>Crear sala</Text>
        <View style={styles.subtitleRow}>
          <Text style={styles.subtitle}>
            Configura tu espacio para estudiar con otros
          </Text>

          <View style={styles.robotContainer}>
            <MaterialCommunityIcons
              name="robot-happy"
              size={16}
              color="#C084FC"
            />
          </View>
        </View>

        {generalError ? (
          <Text style={styles.generalError}>{generalError}</Text>
        ) : null}

        <Text style={styles.label}>Nombre de la sala *</Text>
        <TextInput
          style={[styles.input, errors.nombre && styles.inputError]}
          placeholder="Ej. Sala Pomodoro de Programación"
          placeholderTextColor="#8D74B8"
          value={nombre}
          onChangeText={(text) => {
            setNombre(text);
            if (errors.nombre) {
              setErrors((prev) => ({ ...prev, nombre: undefined }));
            }
          }}
        />
        {errors.nombre ? <Text style={styles.errorText}>{errors.nombre}</Text> : null}

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe el objetivo de la sala"
          placeholderTextColor="#8D74B8"
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
        />

        <Text style={styles.label}>Materia *</Text>

        {loadingMaterias ? (
          <ActivityIndicator color="#C86CFF" style={{ marginVertical: 14 }} />
        ) : (
          <View style={styles.chipsContainer}>
            {materias.map((item) => {
              const selected = materiaId === item.id;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => {
                    setMateriaId(item.id);
                    if (errors.materia_id) {
                      setErrors((prev) => ({ ...prev, materia_id: undefined }));
                    }
                  }}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {item.nombre}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {errors.materia_id ? (
          <Text style={styles.errorText}>{errors.materia_id}</Text>
        ) : null}

        <Text style={styles.label}>Capacidad máxima *</Text>
        <TextInput
          style={[styles.input, errors.capacidad_maxima && styles.inputError]}
          placeholder="Entre 2 y 50"
          placeholderTextColor="#8D74B8"
          value={capacidadMaxima}
          onChangeText={(text) => {
            setCapacidadMaxima(text.replace(/[^0-9]/g, ''));
            if (errors.capacidad_maxima) {
              setErrors((prev) => ({ ...prev, capacidad_maxima: undefined }));
            }
          }}
          keyboardType="numeric"
        />
        {errors.capacidad_maxima ? (
          <Text style={styles.errorText}>{errors.capacidad_maxima}</Text>
        ) : null}

        <TouchableOpacity
          style={styles.buttonWrapper}
          onPress={handleCreateRoom}
          disabled={loading || loadingMaterias}
        >
          <LinearGradient
            colors={['#C86CFF', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Crear sala</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingTop: 28,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 6,
  },
  
  subtitle: {
    color: '#D5C4F4',
    fontSize: 15,
    lineHeight: 21,
  },

  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  label: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 14,
  },

  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 15,
  },

  inputError: {
    borderColor: '#FF80A8',
  },

  textArea: {
    minHeight: 105,
    textAlignVertical: 'top',
  },

  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },

  chip: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  chipSelected: {
    backgroundColor: '#A855F7',
    borderColor: '#A855F7',
  },

  chipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  chipTextSelected: {
    color: '#FFFFFF',
  },
  
  robotContainer: {
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -1 }],
  },

  buttonWrapper: {
    marginTop: 28,
  },

  button: {
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C084FC',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  errorText: {
    color: '#FFB3C8',
    marginTop: 6,
    fontSize: 13,
  },

  generalError: {
    color: '#FFB3C8',
    backgroundColor: 'rgba(255, 128, 168, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 128, 168, 0.25)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
});