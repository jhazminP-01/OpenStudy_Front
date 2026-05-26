import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTimer } from '../../../hooks/useTimer';
import { useCycleNotification } from '../../../hooks/useCycleNotification';
import TimerDisplay from './TimerDisplay';
import TimerControls from './TimerControls';
import TimerVideo from './TimerVideo';
import TimerConfig from './TimerConfig';
import CycleNotification from './CycleNotification';
import { COLORS } from '../../../styles';

const TimerTab = ({ roomId, onOpenModeration, pendingReports = 0 }) => {
  const [configVisible, setConfigVisible] = useState(false);
  const [configuredValues, setConfiguredValues] = useState(null);
  const prevPhaseRef = useRef(null);

  const {
    notificationVisible,
    completedPhase,
    soundEnabled,
    toggleSound,
    showNotification,
    dismissNotification,
  } = useCycleNotification();

  const {
    timerState,
    timeLeft,
    formattedTime,
    phase,
    status,
    progress,
    loading,
    isModerator,
    isActive,
    isPaused,
    isStopped,
    isLongBreakPhase,
    ciclosCompletados,
    ciclosParaDescansoLargo,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    updateConfig,
    completeCycle,
    cycleHistory,
    addToCycleHistory,
    playAmbientSound,
    stopAmbientSound,
  } = useTimer(roomId);

  // Toggle combinado: notificaciones + sonido ambiental
  const handleToggleSound = async () => {
    const newEnabled = !soundEnabled;
    toggleSound();
    if (newEnabled) {
      // Des-silenciar: reanudar sonido si el timer está activo
      if (timerState?.estado === 'activo') {
        playAmbientSound(timerState.fase);
      }
    } else {
      // Silenciar: detener sonido ambiental
      stopAmbientSound(true);
    }
  };

  // Detectar cambio de fase para mostrar notificación
  const timerStatePhaseKey = timerState?.fase + ':' + timerState?.ciclos_completados;
  useEffect(() => {
    if (!timerState) return;
    const currentKey = timerState.fase + ':' + timerState.ciclos_completados;
    if (prevPhaseRef.current && prevPhaseRef.current !== currentKey) {
      const prevPhase = prevPhaseRef.current.split(':')[0];
      showNotification(prevPhase);
      addToCycleHistory(prevPhase);
    }
    prevPhaseRef.current = currentKey;
  }, [timerStatePhaseKey]);

  const handleModerationPress = () => {
    if (onOpenModeration) onOpenModeration();
  };

  const handleSaveConfig = async (config) => {
    await updateConfig(config);
    setConfiguredValues({
      workMinutes: config.estudio,
      breakMinutes: config.descanso,
      longBreakMinutes: config.descansoLargo,
      cyclesBeforeLong: config.ciclosAntesLargo,
    });
  };

  const handleStart = async () => {
    if (configuredValues) {
      await startTimer(configuredValues);
    } else {
      await startTimer();
    }
  };

  const handleResume = async () => {
    // Si el usuario guardó nueva configuración, reiniciar con esos valores en lugar de reanudar
    if (configuredValues) {
      await startTimer(configuredValues);
    } else {
      await resumeTimer();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingPlaceholder} />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {/* Notificación de fin de ciclo */}
      <CycleNotification
        visible={notificationVisible}
        completedPhase={completedPhase}
        onDismiss={dismissNotification}
      />

    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Display del temporizador */}
      <View style={styles.displayContainer}>
        <TimerDisplay
          timeLeft={timeLeft}
          formattedTime={formattedTime}
          phase={phase}
          status={status}
          progress={progress}
          size={220}
        />
      </View>

      {/* Fila: controles izq | GIF centro | botones der */}
      <View style={styles.actionRow}>
        {/* Columna izquierda: play/pause + reiniciar */}
        <View style={styles.leftColumn}>
          <TimerControls
            status={status}
            isModerator={isModerator}
            onStart={handleStart}
            onPause={pauseTimer}
            onResume={handleResume}
            onReset={resetTimer}
            onSkip={completeCycle}
            loading={loading}
          />
        </View>

        {/* Centro: GIF */}
        <TimerVideo size={140} style={styles.gifCenter} />

        {/* Columna derecha: configuración + moderación */}
        <View style={styles.rightColumn}>
          {/* Botón de sonido (todos los usuarios) */}
          <TouchableOpacity
            style={[styles.sideButton, !soundEnabled && styles.sideButtonDisabled]}
            onPress={handleToggleSound}
          >
            <Ionicons
              name={soundEnabled ? 'volume-high-outline' : 'volume-mute-outline'}
              size={22}
              color={soundEnabled ? COLORS.secondary : COLORS.textRoomsTertiary}
            />
          </TouchableOpacity>

          {isModerator && (
            <>
              <TouchableOpacity
                style={styles.sideButton}
                onPress={() => setConfigVisible(true)}
              >
                <Ionicons name="settings-outline" size={22} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sideButton, styles.sideButtonMod]}
                onPress={handleModerationPress}
              >
                <Ionicons name="shield-outline" size={22} color={COLORS.warning} />
                {pendingReports > 0 && (
                  <View style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: COLORS.error,
                    borderWidth: 1.5,
                    borderColor: COLORS.backgroundDark,
                  }} />
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Indicador de estado */}
      <View style={styles.statusRow}>
        <View style={[
          styles.statusDot,
          { backgroundColor: isPaused ? COLORS.warning : isActive ? COLORS.success : COLORS.textRoomsTertiary }
        ]} />
        <Text style={styles.statusText}>
          {isStopped ? 'Temporizador detenido' :
           isPaused ? 'Temporizador pausado' :
           'Temporizador activo'}
        </Text>
      </View>

      {/* Tarjetas de estado */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderColor: phase === 'estudio' ? COLORS.primary : COLORS.secondary }]}>
          <Ionicons
            name={phase === 'estudio' ? 'book-outline' : 'cafe-outline'}
            size={18}
            color={phase === 'estudio' ? COLORS.primary : COLORS.secondary}
          />
          <Text style={[styles.statLabel, { color: phase === 'estudio' ? COLORS.primary : COLORS.secondary }]}>
            {phase === 'estudio' ? 'Estudio' : phase === 'descanso_largo' ? 'Desc. Largo' : 'Descanso'}
          </Text>
          <Text style={styles.statSub}>Fase actual</Text>
        </View>

        {timerState && (
          <View style={[styles.statCard, { borderColor: COLORS.statusActive }]}>
            <Ionicons name="timer-outline" size={18} color={COLORS.statusActive} />
            <Text style={[styles.statLabel, { color: COLORS.statusActive }]}>
              {timerState.duracion_estudio}' / {timerState.duracion_descanso}'
            </Text>
            <Text style={styles.statSub}>Ciclo actual</Text>
          </View>
        )}

        {timerState && (
          <View style={[styles.statCard, { borderColor: COLORS.warning }]}>
            <Ionicons name="flame-outline" size={18} color={COLORS.warning} />
            <Text style={[styles.statLabel, { color: COLORS.warning }]}>
              {ciclosCompletados} / {ciclosParaDescansoLargo}
            </Text>
            <Text style={styles.statSub}>
              {ciclosCompletados === ciclosParaDescansoLargo - 1 ? '¡Casi desc. largo!' : 'Pomodoros'}
            </Text>
          </View>
        )}
      </View>

      {!isModerator && (
        <View style={styles.participantInfo}>
          <Ionicons name="eye-outline" size={14} color={COLORS.textRoomsTertiary} />
          <Text style={styles.participantText}>
            Solo el moderador puede controlar el temporizador
          </Text>
        </View>
      )}

      {cycleHistory.length > 0 && (
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Ionicons name="time-outline" size={14} color={COLORS.textRoomsSecondary} />
            <Text style={styles.historyTitle}>Historial de ciclos</Text>
          </View>
          {cycleHistory.map((item, index) => (
            <View key={`${item.id || 'item'}-${index}`} style={styles.historyItem}>
              <View style={[styles.historyDot, {
                backgroundColor: item.phase === 'estudio' ? COLORS.primary :
                                 item.phase === 'descanso_largo' ? COLORS.accent : COLORS.secondary
              }]} />
              <Ionicons
                name={item.phase === 'estudio' ? 'book-outline' : item.phase === 'descanso_largo' ? 'moon-outline' : 'cafe-outline'}
                size={13}
                color={item.phase === 'estudio' ? COLORS.primary : item.phase === 'descanso_largo' ? COLORS.accent : COLORS.secondary}
              />
              <Text style={styles.historyText}>
                {item.phase === 'estudio' ? 'Estudio completado' :
                 item.phase === 'descanso_largo' ? 'Descanso largo completado' :
                 'Descanso completado'}
              </Text>
              <Text style={styles.historyTime}>{item.time}</Text>
            </View>
          ))}
        </View>
      )}

    </ScrollView>

      <TimerConfig
        visible={configVisible}
        onClose={() => setConfigVisible(false)}
        onSave={handleSaveConfig}
        currentEstudio={timerState?.duracion_estudio_siguiente ?? 25}
        currentDescanso={timerState?.duracion_descanso_siguiente ?? 5}
        currentDescansoLargo={timerState?.duracion_descanso_largo_siguiente ?? 30}
        currentCiclosAntesLargo={timerState?.ciclos_antes_descanso_largo_siguiente ?? 4}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'relative',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingPlaceholder: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.border,
    opacity: 0.3,
  },
  displayContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  leftColumn: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gifCenter: {
    marginVertical: 0,
  },
  rightColumn: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  sideButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideButtonMod: {
    borderColor: COLORS.warning,
  },
  sideButtonDisabled: {
    borderColor: COLORS.textRoomsTertiary,
    opacity: 0.5,
  },
  historyContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textRoomsSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  historyText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textRoomsPrimary,
  },
  historyTime: {
    fontSize: 12,
    color: COLORS.textRoomsTertiary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.textRoomsSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  statSub: {
    fontSize: 10,
    color: COLORS.textRoomsTertiary,
    textAlign: 'center',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.backgroundCard,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 12,
  },
  participantText: {
    fontSize: 11,
    color: COLORS.textRoomsTertiary,
    fontStyle: 'italic',
    flex: 1,
  },
  historyContainer: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderRoomsMedium,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textRoomsSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderRoomsLight,
  },
  historyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  historyText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textRoomsSecondary,
  },
  historyTime: {
    fontSize: 11,
    color: COLORS.textRoomsTertiary,
  },
});

export default TimerTab;
