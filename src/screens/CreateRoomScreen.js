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
  const [successMessage, setSuccessMessage] = useState('');
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
    } catch (error) {
      setGeneralError('Ocurrió un error al cargar las materias');
    } finally {
      setLoadingMaterias(false);
    }
  };

  const handleCreateRoom = async () => {
    setSuccessMessage('');
    setGeneralError('');

    const validationErrors = validateCreateRoom({
      nombre,
      materia_id: materiaId,
      capacidad_maxima: capacidadMaxima,
    });

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

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

      console.log('Sala creada:', data);

      setSuccessMessage(
        `Sala creada correctamente. Código: ${data.codigo_invitacion}`
      );

      setNombre('');
      setDescripcion('');
      setMateriaId(null);
      setCapacidadMaxima('');
      setErrors({});
    } catch (err) {
      console.log('Error inesperado al crear sala:', err);
      setGeneralError('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crear sala</Text>

      {successMessage ? (
        <Text style={styles.successText}>{successMessage}</Text>
      ) : null}

      {generalError ? (
        <Text style={styles.errorText}>{generalError}</Text>
      ) : null}

      <Text style={styles.label}>Nombre de la sala *</Text>
      <TextInput
        style={[styles.input, errors.nombre && styles.inputError]}
        placeholder="Ej. Sala Pomodoro de Programación"
        value={nombre}
        onChangeText={(text) => {
          setNombre(text);
          if (errors.nombre) {
            setErrors((prev) => ({ ...prev, nombre: undefined }));
          }
        }}
      />
      {errors.nombre ? (
        <Text style={styles.errorText}>{errors.nombre}</Text>
      ) : null}

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe el objetivo de la sala"
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
      />

      <Text style={styles.label}>Materia *</Text>

      {loadingMaterias ? (
        <ActivityIndicator style={{ marginVertical: 12 }} />
      ) : materias.length === 0 ? (
        <Text style={styles.errorText}>
          No hay materias registradas todavía.
        </Text>
      ) : (
        <View style={styles.categoriesContainer}>
          {materias.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.categoryButton,
                materiaId === item.id && styles.categoryButtonSelected,
              ]}
              onPress={() => {
                setMateriaId(item.id);
                if (errors.materia_id) {
                  setErrors((prev) => ({ ...prev, materia_id: undefined }));
                }
              }}
            >
              <Text
                style={[
                  styles.categoryText,
                  materiaId === item.id && styles.categoryTextSelected,
                ]}
              >
                {item.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {errors.materia_id ? (
        <Text style={styles.errorText}>{errors.materia_id}</Text>
      ) : null}

      <Text style={styles.label}>Capacidad máxima *</Text>
      <TextInput
        style={[styles.input, errors.capacidad_maxima && styles.inputError]}
        placeholder="Entre 2 y 50"
        value={capacidadMaxima}
        onChangeText={(text) => {
          setCapacidadMaxima(text.replace(/[^0-9]/g, ''));
          if (errors.capacidad_maxima) {
            setErrors((prev) => ({
              ...prev,
              capacidad_maxima: undefined,
            }));
          }
        }}
        keyboardType="numeric"
      />
      {errors.capacidad_maxima ? (
        <Text style={styles.errorText}>{errors.capacidad_maxima}</Text>
      ) : null}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCreateRoom}
        disabled={loading || loadingMaterias}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Crear sala</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#ef4444',
    marginTop: 6,
    marginBottom: 6,
  },
  successText: {
    color: '#16a34a',
    marginBottom: 12,
    fontWeight: '600',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  categoryText: {
    color: '#334155',
  },
  categoryTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#2563eb',
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});