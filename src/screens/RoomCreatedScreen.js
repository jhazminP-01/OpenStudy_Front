import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { COLORS } from '../styles/colors';
import { Button } from '../components/ui';

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
      <Button
        title="Ir a la Sala"
        onPress={() => {
          // luego aquí irá entrar a la sala
          navigation.navigate('RoomsList');
        }}
      />

      {/* Botón secundario */}
      <Button
        title="Volver al inicio"
        onPress={() => navigation.navigate('RoomsList')}
        variant="outline"
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  check: {
    color: COLORS.textWhite,
    fontSize: 36,
    fontWeight: 'bold',
  },

  title: {
    color: COLORS.textWhite,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },

  subtitle: {
    color: COLORS.textLight,
    marginBottom: 20,
  },

  card: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },

  roomName: {
    color: COLORS.textWhite,
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
    color: COLORS.textLight,
  },

  value: {
    color: COLORS.textWhite,
    fontWeight: '500',
  },

  badge: {
    backgroundColor: COLORS.primary,
    color: COLORS.textWhite,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
  },
});