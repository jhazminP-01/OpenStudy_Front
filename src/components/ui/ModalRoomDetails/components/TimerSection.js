import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../../styles';

const PHASE_CONFIG = {
  estudio: {
    badge: '🍅 En estudio',
    badgeColor: '#7C3AED',
    badgeBorder: '#A78BFA',
  },
  descanso: {
    badge: '☕ En descanso',
    badgeColor: '#065F46',
    badgeBorder: '#059669',
  },
  descanso_largo: {
    badge: '🛋️ Descanso largo',
    badgeColor: '#92400E',
    badgeBorder: '#D97706',
  },
};

const formatTime = (seconds) => {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const TimerSection = ({ timerData, timeLeft = 0 }) => {
  // Sin iniciar
  if (!timerData) {
    return (
      <View style={styles.container}>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, styles.badgeNeutral]}>
            <Ionicons name="ellipse-outline" size={10} color={COLORS.textRoomsTertiary} />
            <Text style={[styles.badgeText, { color: COLORS.textRoomsTertiary }]}>Sin iniciar</Text>
          </View>
        </View>
        <View style={styles.clockContainer}>
          <Ionicons name="timer-outline" size={44} color="rgba(139,92,246,0.3)" />
        </View>
        <Text style={styles.messageText}>
          El temporizador estará disponible cuando el moderador inicie la sesión.
        </Text>
        <Text style={styles.subText}>Esperando inicio</Text>
      </View>
    );
  }

  const isPaused = timerData.estado === 'pausado';
  const phaseConfig = PHASE_CONFIG[timerData.fase] || PHASE_CONFIG.estudio;

  const ciclosCompletados = timerData.ciclos_completados || 0;
  const ciclosParaLargo = timerData.ciclos_antes_descanso_largo || 4;
  const sesionActual = ciclosCompletados + 1;
  const isDescanso = timerData.fase === 'descanso' || timerData.fase === 'descanso_largo';

  return (
    <View style={styles.container}>
      <View style={styles.badgeRow}>
        {isPaused ? (
          <View style={[styles.badge, { backgroundColor: '#374151', borderColor: '#6B7280' }]}>
            <Text style={styles.badgeText}>⏸ Pausado</Text>
          </View>
        ) : (
          <View style={[styles.badge, { backgroundColor: phaseConfig.badgeColor, borderColor: phaseConfig.badgeBorder }]}>
            <Text style={styles.badgeText}>{phaseConfig.badge}</Text>
          </View>
        )}
      </View>

      <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>

      {isDescanso ? (
        <Text style={styles.sessionText}>
          Descanso después de sesión {ciclosCompletados} de {ciclosParaLargo}
        </Text>
      ) : (
        <Text style={styles.sessionText}>
          Sesión {sesionActual} de {ciclosParaLargo}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeNeutral: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.15)',
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  clockContainer: {
    marginVertical: 4,
  },
  messageText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textRoomsTertiary,
    textAlign: 'center',
    marginBottom: 2,
  },
  subText: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'center',
  },
  timeText: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.textWhite,
    letterSpacing: 2,
    marginBottom: 2,
  },
  sessionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textRoomsSecondary,
  },
});

export default TimerSection;
