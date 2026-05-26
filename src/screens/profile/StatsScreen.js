import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles';
import { useAuth } from '../../hooks/useAuth';
import { profileService } from '../../services/profile';

const StatsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ dias_seguidos: 0, horas_semana: 0, pomodoros: 0, eficiencia: 0 });
  const [chartData, setChartData] = useState([{ dia: 'L', horas: 0 }, { dia: 'M', horas: 0 }, { dia: 'X', horas: 0 }, { dia: 'J', horas: 0 }, { dia: 'V', horas: 0 }, { dia: 'S', horas: 0 }, { dia: 'D', horas: 0 }]);
  const [activity, setActivity] = useState([]);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const [statsRes, chartRes, activityRes] = await Promise.all([
      profileService.getWeeklyStats(user.id),
      profileService.getWeeklyChartData(user.id),
      profileService.getRecentActivity(user.id),
    ]);
    if (statsRes.data) setStats(statsRes.data);
    if (chartRes.data) setChartData(chartRes.data);
    if (activityRes.data) setActivity(activityRes.data);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const hasData = stats.pomodoros > 0 || stats.horas_semana > 0 || activity.length > 0;

  const maxHoras = Math.max(...chartData.map((d) => d.horas), 8);
  const yLabels = [0, Math.ceil(maxHoras / 4), Math.ceil(maxHoras / 2), Math.ceil((maxHoras * 3) / 4), Math.ceil(maxHoras)];

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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Estadísticas</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* RESUMEN SEMANAL */}
        <Text style={styles.sectionLabel}>RESUMEN SEMANAL</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconCircle}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.statNumber}>{stats.dias_seguidos}</Text>
            <Text style={styles.statLabel}>Días seguidos</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconCircle}>
              <Ionicons name="time-outline" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.statNumber}>{stats.horas_semana}h</Text>
            <Text style={styles.statLabel}>Total semana</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconCircle}>
              <Ionicons name="nutrition-outline" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.statNumber}>{stats.pomodoros}</Text>
            <Text style={styles.statLabel}>Pomodoros</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconCircle}>
              <Ionicons name="trending-up-outline" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.statNumber}>{stats.eficiencia}%</Text>
            <Text style={styles.statLabel}>Eficiencia</Text>
          </View>
        </View>

        {/* HORAS DE ENFOQUE */}
        <Text style={styles.sectionLabel}>HORAS DE ENFOQUE</Text>

        <View style={styles.chartCard}>
          <View style={styles.chartContainer}>
            {/* Eje Y */}
            <View style={styles.yAxis}>
              {yLabels
                .slice()
                .reverse()
                .map((label, i) => (
                  <Text key={i} style={styles.yLabel}>
                    {label}h
                  </Text>
                ))}
            </View>

            {/* Barras */}
            <View style={styles.barsContainer}>
              {chartData.map((item, index) => {
                const heightPercent = maxHoras > 0 ? (item.horas / maxHoras) * 100 : 0;
                return (
                  <View key={index} style={styles.barColumn}>
                    <View style={styles.barWrapper}>
                      <View
                        style={[
                          styles.bar,
                          { height: `${Math.max(heightPercent, 2)}%` },
                          item.horas === 0 && styles.barEmpty,
                        ]}
                      />
                    </View>
                    <Text style={styles.xLabel}>{item.dia}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Estado vacío */}
        {!hasData && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="star-outline" size={32} color={COLORS.primaryLight} />
            </View>
            <Text style={styles.emptyTitle}>Aún no tienes estadísticas registradas</Text>
            <Text style={styles.emptySubtitle}>Completa sesiones Pomodoro para ver tu progreso aquí.</Text>
          </View>
        )}

        {/* ACTIVIDAD RECIENTE */}
        <Text style={styles.sectionLabel}>ACTIVIDAD RECIENTE</Text>

        <View style={styles.activityCard}>
          {activity.length > 0 ? (
            activity.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.activityItem, index < activity.length - 1 && styles.activityItemBorder]}
                activeOpacity={0.7}
              >
                <View style={styles.activityLeft}>
                  <View style={styles.activityIconCircle}>
                    <Ionicons name="book-outline" size={16} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={styles.activityRoom}>{item.sala_nombre}</Text>
                    <Text style={styles.activityDate}>{item.fecha_formateada}</Text>
                  </View>
                </View>
                <View style={styles.activityRight}>
                  <Text style={styles.activityDuration}>{item.duracion_formateada}</Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textRoomsTertiary} />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyActivity}>
              <Ionicons name="time-outline" size={32} color={COLORS.textRoomsTertiary} />
              <Text style={styles.emptyActivityTitle}>No hay actividad reciente</Text>
              <Text style={styles.emptyActivitySub}>Completa sesiones para ver tu historial aquí.</Text>
            </View>
          )}
        </View>

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textWhite,
    letterSpacing: 0.3,
  },
  headerSpacer: {
    width: 40,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textRoomsTertiary,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.successIconBg,
    borderRadius: SPACING.borderRadius.lg,
    borderWidth: 1,
    borderColor: COLORS.borderRoomsExtra,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    gap: 6,
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.successIconBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textRoomsTertiary,
    fontWeight: '500',
  },
  chartCard: {
    backgroundColor: COLORS.backgroundRoomsLight,
    borderRadius: SPACING.borderRadius.lg,
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
    padding: SPACING.md,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 160,
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingRight: SPACING.sm,
    height: '100%',
  },
  yLabel: {
    fontSize: 10,
    color: COLORS.textRoomsTertiary,
    fontWeight: '500',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 16,
    height: '100%',
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  barWrapper: {
    width: 12,
    height: '85%',
    justifyContent: 'flex-end',
    backgroundColor: COLORS.borderRoomsMedium,
    borderRadius: 6,
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    minHeight: 4,
  },
  barEmpty: {
    backgroundColor: COLORS.successIconBg,
  },
  xLabel: {
    fontSize: 10,
    color: COLORS.textRoomsTertiary,
    marginTop: 4,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.successIconBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textWhite,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textRoomsTertiary,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  activityCard: {
    backgroundColor: COLORS.backgroundRoomsLight,
    borderRadius: SPACING.borderRadius.lg,
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundRoomsMedium,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  activityIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.successIconBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityRoom: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textWhite,
  },
  activityDate: {
    fontSize: 12,
    color: COLORS.textRoomsTertiary,
    marginTop: 1,
  },
  activityRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  activityDuration: {
    fontSize: 13,
    color: COLORS.textRoomsSecondary,
    fontWeight: '500',
  },
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyActivityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textWhite,
    marginTop: SPACING.sm,
    marginBottom: 4,
  },
  emptyActivitySub: {
    fontSize: 12,
    color: COLORS.textRoomsTertiary,
  },
  bottomPad: {
    height: 90,
  },
});

export default StatsScreen;
