import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function RoomCreatedScreen({ navigation, route }) {
  const sala = route.params?.sala;
  const materiaNombre = route.params?.materiaNombre || 'Materia';

  return (
    <View style={styles.container}>
      
      {/* Icono check */}
      <View style={styles.iconContainer}>
        <Text style={styles.check}>✓</Text>
      </View>

      {/* Título */}
      <Text style={styles.title}>¡Sala Creada!</Text>
      <Text style={styles.subtitle}>
        Tu sala de estudio está lista
      </Text>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.roomName}>
          {sala?.nombre}
        </Text>

        <View style={styles.row}>
          <Text style={styles.label}>Categoría</Text>
          <Text style={styles.badge}>{materiaNombre}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Participantes</Text>
          <Text style={styles.value}>0/{sala?.capacidad_maxima}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Código</Text>
          <Text style={styles.value}>{sala?.codigo_invitacion}</Text>
        </View>
      </View>

      {/* Botón principal */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => {
          // luego aquí irá entrar a la sala
          navigation.navigate('RoomsList');
        }}
      >
        <Text style={styles.primaryText}>Ir a la Sala</Text>
      </TouchableOpacity>

      {/* Botón secundario */}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('RoomsList')}
      >
        <Text style={styles.secondaryText}>Volver al inicio</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#14051F',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  check: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },

  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },

  subtitle: {
    color: '#c4b5fd',
    marginBottom: 20,
  },

  card: {
    width: '100%',
    backgroundColor: '#2A123D',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },

  roomName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  label: {
    color: '#c4b5fd',
  },

  value: {
    color: '#fff',
    fontWeight: '500',
  },

  badge: {
    backgroundColor: '#8B5CF6',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
  },

  primaryButton: {
    width: '100%',
    backgroundColor: '#8B5CF6',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },

  primaryText: {
    color: '#fff',
    fontWeight: '700',
  },

  secondaryButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  secondaryText: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
});