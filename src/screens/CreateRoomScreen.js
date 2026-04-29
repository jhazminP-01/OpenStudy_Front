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
import { COLORS, SPACING, TYPOGRAPHY } from '../styles';
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
      colors={COLORS.gradientRooms}
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
          <Ionicons name="arrow-back" size={22} color={COLORS.iconBack} />
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
              color={COLORS.iconRobot}
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
          placeholderTextColor={COLORS.placeholderTextColor}
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
          placeholderTextColor={COLORS.placeholderTextColor}
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
        />

        <Text style={styles.label}>Materia *</Text>

        {loadingMaterias ? (
          <ActivityIndicator color={COLORS.activityIndicator} style={{ marginVertical: 14 }} />
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
          placeholderTextColor={COLORS.placeholderTextColor}
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
            colors={COLORS.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.activityIndicatorWhite} />
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
    padding: SPACING.rooms.paddingX,
    paddingTop: SPACING.rooms.paddingTop,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.backgroundRoomsMedium,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.rooms.marginBottomMedium,
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
  },

  title: {
    ...TYPOGRAPHY.rooms.title,
    color: COLORS.textWhite,
    marginBottom: SPACING.rooms.marginBottomSmall,
  },
  
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsSecondary,
    lineHeight: 21,
  },

  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.rooms.marginBottomLarge,
  },

  label: {
    color: COLORS.textWhite,
    ...TYPOGRAPHY.body,
    fontWeight: '700',
    marginBottom: SPACING.rooms.marginBottomSmall,
    marginTop: SPACING.rooms.marginBottomMedium,
  },

  input: {
    backgroundColor: COLORS.backgroundRoomsMedium,
    borderWidth: 1,
    borderColor: COLORS.borderRoomsMedium,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.textWhite,
    ...TYPOGRAPHY.body,
  },

  inputError: {
    borderColor: COLORS.errorBorder,
  },

  textArea: {
    minHeight: 105,
    textAlignVertical: 'top',
  },

  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.rooms.gapMedium,
    marginTop: 4,
  },

  chip: {
    borderWidth: 1,
    borderColor: COLORS.borderRoomsExtra,
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.backgroundRoomsLight,
  },

  chipSelected: {
    backgroundColor: COLORS.filterChipSelected,
    borderColor: COLORS.filterChipSelected,
  },

  chipText: {
    color: COLORS.textWhite,
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },

  chipTextSelected: {
    color: COLORS.textWhite,
  },
  
  robotContainer: {
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -1 }],
  },

  buttonWrapper: {
    marginTop: SPACING.rooms.marginBottomLarge,
  },

  button: {
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadowRooms,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  buttonText: {
    color: COLORS.textWhite,
    ...TYPOGRAPHY.body,
    fontWeight: '700',
  },

  errorText: {
    color: COLORS.textRoomsError,
    marginTop: SPACING.rooms.marginBottomSmall,
    ...TYPOGRAPHY.rooms.badge,
  },

  generalError: {
    color: COLORS.textRoomsError,
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.errorBorderLight,
    borderRadius: 14,
    padding: 12,
    marginBottom: SPACING.rooms.marginBottomMedium,
  },
});