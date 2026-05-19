import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../styles';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function RoomCreatedScreen({ navigation, route }) {
  const sala = route.params?.sala;
  const materiaNombre = route.params?.materiaNombre || 'Materia';
  const { width } = useWindowDimensions();
  const isSmallMobile = width < 390;

  return (
  <LinearGradient
    colors={COLORS.gradientRooms}
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
        <Ionicons name="checkmark-circle" size={82} color={COLORS.iconSuccess} />
      </View>

      <Text style={styles.title}>¡Sala creada!</Text>

      <View style={styles.subtitleRow}>
        <Text style={styles.subtitle}>Tu sala de estudio está lista</Text>
        <MaterialCommunityIcons
          name="robot-happy"
          size={17}
          color={COLORS.iconSuccess}
          style={{ marginLeft: 6 }}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.roomName}>{sala?.nombre || 'Nueva sala'}</Text>

        <View style={styles.row}>
          <View style={styles.labelRow}>
            <Ionicons name="book-outline" size={16} color={COLORS.textRoomsTertiary} />
            <Text style={styles.label}>Categoría</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{materiaNombre}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.labelRow}>
            <Ionicons name="people-outline" size={16} color={COLORS.textRoomsTertiary} />
            <Text style={styles.label}>Participantes</Text>
          </View>
          <Text style={styles.value}>0/{sala?.capacidad_maxima || 0}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.labelRow}>
            <Ionicons name="key-outline" size={16} color={COLORS.iconCode} />
            <Text style={styles.label}>Código</Text>
          </View>
          <Text style={styles.value}>{sala?.codigo_invitacion || '------'}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButtonWrapper}
        onPress={() => navigation.navigate('Room', { roomId: sala?.id })}
      >
        <LinearGradient
          colors={COLORS.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryText}>Ir a la sala</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'RoomsList' }] })}
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
    paddingHorizontal: SPACING.rooms.paddingX,
    paddingBottom: SPACING.rooms.paddingBottom,
  },

  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.rooms.marginBottomLarge,
    backgroundColor: COLORS.successIconBg,
    borderWidth: 1,
    borderColor: COLORS.successIconBorder,
    shadowColor: COLORS.shadowRooms,
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  title: {
    ...TYPOGRAPHY.rooms.title,
    color: COLORS.textWhite,
    textAlign: 'center',
    marginBottom: SPACING.rooms.marginBottomSmall,
  },

  subtitleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.rooms.marginBottomLarge,
  },

  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsSecondary,
    textAlign: 'center',
  },

  card: {
    backgroundColor: COLORS.cardRoomsBackground,
    borderRadius: SPACING.borderRadiusRooms.card,
    padding: 18,
    marginBottom: SPACING.rooms.marginBottomLarge,
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
  },

  roomName: {
    ...TYPOGRAPHY.rooms.cardTitle,
    color: COLORS.textWhite,
    marginBottom: SPACING.rooms.marginBottomMedium,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.rooms.marginBottomMedium,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  label: {
    color: COLORS.textRoomsSecondary,
    ...TYPOGRAPHY.body,
    marginLeft: 7,
  },

  value: {
    color: COLORS.textWhite,
    fontWeight: '800',
    ...TYPOGRAPHY.body,
  },

  badge: {
    backgroundColor: COLORS.buttonPurple,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },

  badgeText: {
    color: COLORS.textWhite,
    ...TYPOGRAPHY.rooms.badge,
    fontWeight: '700',
  },

  primaryButtonWrapper: {
    marginBottom: SPACING.rooms.marginBottomMedium,
  },

  primaryButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadowRooms,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  primaryText: {
    color: COLORS.textWhite,
    ...TYPOGRAPHY.body,
    fontWeight: '800',
  },

  secondaryButton: {
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.secondaryButtonBorder,
    backgroundColor: COLORS.backgroundRoomsLight,
  },

  secondaryText: {
    color: COLORS.textRoomsTertiary,
    ...TYPOGRAPHY.body,
    fontWeight: '700',
  },
});