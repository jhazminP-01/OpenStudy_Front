import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles';
import { useAuth } from '../../hooks/useAuth';
import { profileService } from '../../services/profile';
import { supabase } from '../../../lib/supabase';

const ProfileScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ nombre_completo: '', email: '' });
  const [stats, setStats] = useState({ sesiones: 0, horas: 0, salas: 0 });
  const [config, setConfig] = useState({
    notificaciones: true,
    modo_oscuro: false,
    sonidos_timer: true,
    sonido_enfoque: 'campana',
    sonido_descanso: 'chime',
  });

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const [profileRes, statsRes, configRes] = await Promise.all([
      profileService.getProfile(user.id),
      profileService.getStats(user.id),
      profileService.getConfig(user.id),
    ]);
    if (profileRes.data) setProfile(profileRes.data);
    if (statsRes.data) setStats(statsRes.data);
    if (configRes.data) setConfig(configRes.data);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggle = async (key, value) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
    await profileService.updateConfig(user.id, updated);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (_) {
      // Si no hay internet, forzar cierre de sesión local
      await supabase.auth.signOut({ scope: 'local' });
    }
  };

  const initial = profile.nombre_completo?.charAt(0)?.toUpperCase() || '?';

  if (loading) {
    return (
      <LinearGradient colors={COLORS.gradientRooms} style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={COLORS.gradientRooms} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
        </View>

        {/* Avatar + Info */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
          <Text style={styles.profileName}>{profile.nombre_completo}</Text>
          <Text style={styles.profileEmail}>{profile.email}</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.sesiones}</Text>
            <Ionicons name="bar-chart-outline" size={16} color={COLORS.primaryLight} />
            <Text style={styles.statLabel}>Sesiones</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.horas}<Text style={styles.statUnit}>h</Text></Text>
            <Ionicons name="time-outline" size={16} color={COLORS.primaryLight} />
            <Text style={styles.statLabel}>Enfoque</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.salas}</Text>
            <Ionicons name="people-outline" size={16} color={COLORS.primaryLight} />
            <Text style={styles.statLabel}>Salas</Text>
          </View>
        </View>

        {/* Ver Estadísticas */}
        <TouchableOpacity
          style={styles.statsCard}
          onPress={() => navigation.navigate('Stats')}
          activeOpacity={0.7}
        >
          <View style={styles.statsCardLeft}>
            <View style={styles.statsCardIcon}>
              <Ionicons name="stats-chart" size={20} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.statsCardTitle}>Ver Estadísticas</Text>
              <Text style={styles.statsCardSub}>Análisis detallado de tu progreso</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textRoomsTertiary} />
        </TouchableOpacity>

        {/* Configuración */}
        <Text style={styles.sectionLabel}>CONFIGURACIÓN</Text>

        <View style={styles.configCard}>
          {/* Notificaciones */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.primaryLight} />
              <Text style={styles.toggleLabel}>Notificaciones</Text>
            </View>
            <Switch
              value={config.notificaciones}
              onValueChange={(v) => handleToggle('notificaciones', v)}
              trackColor={{ false: COLORS.borderRoomsMedium, true: COLORS.primary }}
              thumbColor={COLORS.textWhite}
            />
          </View>

          <View style={styles.toggleDivider} />

          {/* Modo Oscuro */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <Ionicons name="moon-outline" size={20} color={COLORS.primaryLight} />
              <Text style={styles.toggleLabel}>Modo Oscuro</Text>
            </View>
            <Switch
              value={config.modo_oscuro}
              onValueChange={(v) => handleToggle('modo_oscuro', v)}
              trackColor={{ false: COLORS.borderRoomsMedium, true: COLORS.primary }}
              thumbColor={COLORS.textWhite}
            />
          </View>

          <View style={styles.toggleDivider} />

          {/* Sonidos Timer */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <Ionicons name="volume-high-outline" size={20} color={COLORS.primaryLight} />
              <Text style={styles.toggleLabel}>Sonidos del temporizador</Text>
            </View>
            <Switch
              value={config.sonidos_timer}
              onValueChange={(v) => handleToggle('sonidos_timer', v)}
              trackColor={{ false: COLORS.borderRoomsMedium, true: COLORS.primary }}
              thumbColor={COLORS.textWhite}
            />
          </View>

          {/* Subcards de sonidos */}
          {config.sonidos_timer && (
            <View style={styles.soundSubCards}>
              <TouchableOpacity
                style={styles.soundRow}
                onPress={() => navigation.navigate('Sounds')}
                activeOpacity={0.7}
              >
                <Text style={styles.soundLabel}>Sonido de enfoque</Text>
                <View style={styles.soundRight}>
                  <Text style={styles.soundActive}>Activo</Text>
                  <Text style={styles.soundConfig}>Configurar &gt;</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.soundDivider} />

              <TouchableOpacity
                style={styles.soundRow}
                onPress={() => navigation.navigate('Sounds')}
                activeOpacity={0.7}
              >
                <Text style={styles.soundLabel}>Sonido de descanso</Text>
                <View style={styles.soundRight}>
                  <Text style={styles.soundActive}>Activo</Text>
                  <Text style={styles.soundConfig}>Configurar &gt;</Text>
                </View>
              </TouchableOpacity>

              <Text style={styles.soundNote}>
                Al desactivar los sonidos del temporizador se evitarán ambos sonidos.
              </Text>
            </View>
          )}
        </View>

        {/* Cerrar Sesión */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="exit-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <View style={styles.bottomPad} />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: 56,
    paddingBottom: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textWhite,
    letterSpacing: 0.3,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryDark,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textWhite,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.textRoomsTertiary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.successIconBg,
    borderRadius: SPACING.borderRadius.lg,
    borderWidth: 1,
    borderColor: COLORS.borderRoomsExtra,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
  statUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textWhite,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textRoomsTertiary,
    fontWeight: '500',
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundRoomsLight,
    borderRadius: SPACING.borderRadius.lg,
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  statsCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statsCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.successIconBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textWhite,
  },
  statsCardSub: {
    fontSize: 12,
    color: COLORS.textRoomsTertiary,
    marginTop: 1,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textRoomsTertiary,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  configCard: {
    backgroundColor: COLORS.backgroundRoomsLight,
    borderRadius: SPACING.borderRadius.lg,
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm + 2,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  toggleLabel: {
    fontSize: 15,
    color: COLORS.textWhite,
    fontWeight: '500',
  },
  toggleDivider: {
    height: 1,
    backgroundColor: COLORS.backgroundRoomsMedium,
  },
  soundSubCards: {
    backgroundColor: COLORS.backgroundRoomsDark,
    borderRadius: SPACING.borderRadius.md,
    marginTop: 4,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  soundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  soundDivider: {
    height: 1,
    backgroundColor: COLORS.backgroundRoomsMedium,
  },
  soundLabel: {
    fontSize: 13,
    color: COLORS.textRoomsSecondary,
  },
  soundRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  soundActive: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
  },
  soundConfig: {
    fontSize: 12,
    color: COLORS.primaryLight,
    fontWeight: '500',
  },
  soundNote: {
    fontSize: 11,
    color: COLORS.textRoomsMuted,
    paddingVertical: SPACING.sm,
    lineHeight: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.errorBorderLight,
    borderRadius: SPACING.borderRadius.lg,
    paddingVertical: SPACING.md,
    marginTop: SPACING.xs,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.error,
  },
  bottomPad: {
    height: 90,
  },
});

export default ProfileScreen;
