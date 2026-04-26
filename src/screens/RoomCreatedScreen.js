import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function RoomCreatedScreen({ navigation, route }) {
  const sala = route.params?.sala;
  const materiaNombre = route.params?.materiaNombre || 'Materia';
  const { width } = useWindowDimensions();
  const isSmallMobile = width < 390;

  return (
  <LinearGradient
    colors={['#4B1387', '#170531', '#070016']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.container}
  >
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.content,
        { paddingTop: isSmallMobile ? 42 : 58 },
      ]}
    >
      <View style={styles.successIcon}>
        <Ionicons name="checkmark-circle" size={82} color="#D8B4FE" />
      </View>

      <Text style={styles.title}>¡Sala creada!</Text>

      <View style={styles.subtitleRow}>
        <Text style={styles.subtitle}>Tu sala de estudio está lista</Text>
        <MaterialCommunityIcons
          name="robot-happy"
          size={17}
          color="#D8B4FE"
          style={{ marginLeft: 6 }}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.roomName}>{sala?.nombre || 'Nueva sala'}</Text>

        <View style={styles.row}>
          <View style={styles.labelRow}>
            <Ionicons name="book-outline" size={16} color="#C4B5FD" />
            <Text style={styles.label}>Categoría</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{materiaNombre}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.labelRow}>
            <Ionicons name="people-outline" size={16} color="#C4B5FD" />
            <Text style={styles.label}>Participantes</Text>
          </View>
          <Text style={styles.value}>0/{sala?.capacidad_maxima || 0}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.labelRow}>
            <Ionicons name="key-outline" size={16} color="#FACC15" />
            <Text style={styles.label}>Código</Text>
          </View>
          <Text style={styles.value}>{sala?.codigo_invitacion || '------'}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButtonWrapper}
        onPress={() => navigation.navigate('RoomsList', { refresh: true })}
      >
        <LinearGradient
          colors={['#C86CFF', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryText}>Ir a la sala</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('RoomsList', { refresh: true })}
      >
        <Text style={styles.secondaryText}>Volver al inicio</Text>
      </TouchableOpacity>

      <View style={{ height: 110 }} />
    </ScrollView>
  </LinearGradient>
);
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },

  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(216, 180, 254, 0.18)',
    shadowColor: '#C084FC',
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },

  subtitleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  subtitle: {
    color: '#D5C4F4',
    fontSize: 15,
    textAlign: 'center',
  },

  card: {
    backgroundColor: 'rgba(22, 10, 56, 0.86)',
    borderRadius: 24,
    padding: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  roomName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 18,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  label: {
    color: '#D5C4F4',
    fontSize: 14,
    marginLeft: 7,
  },

  value: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },

  badge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },

  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  primaryButtonWrapper: {
    marginBottom: 12,
  },

  primaryButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C084FC',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  secondaryButton: {
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(216, 180, 254, 0.45)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  secondaryText: {
    color: '#D8B4FE',
    fontSize: 15,
    fontWeight: '700',
  },
});