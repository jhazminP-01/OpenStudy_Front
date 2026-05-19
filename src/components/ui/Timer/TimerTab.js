import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTimer } from '../../../hooks/useTimer';
import TimerDisplay from './TimerDisplay';
import TimerControls from './TimerControls';
import TimerVideo from './TimerVideo';
import TimerConfig from './TimerConfig';
import { COLORS } from '../../../styles';

const TimerTab = ({ roomId }) => {
  const [configVisible, setConfigVisible] = useState(false);
  const [configuredValues, setConfiguredValues] = useState(null);

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
  } = useTimer(roomId);

  const handleModerationPress = () => {
    Alert.alert('Moderación', 'El panel de moderación estará disponible próximamente.');
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
            loading={loading}
          />
        </View>

        {/* Centro: GIF */}
        <TimerVideo size={140} style={styles.gifCenter} />

        {/* Columna derecha: configuración + moderación */}
        <View style={styles.rightColumn}>
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

      {/* Información adicional */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <View style={[
              styles.phaseIndicator,
              { backgroundColor: phase === 'estudio' ? COLORS.primary : COLORS.secondary }
            ]} />
            <Text style={styles.infoText}>
              Fase: {phase === 'estudio' ? 'Estudio' : 'Descanso'}
            </Text>
          </View>
        </View>

        {timerState && (
          <>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoText}>
                  Ciclo actual: {timerState.duracion_estudio}min estudio / {timerState.duracion_descanso}min descanso
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoText}>
                  Pomodoros: {ciclosCompletados} / {ciclosParaDescansoLargo}
                  {ciclosCompletados === ciclosParaDescansoLargo - 1 ? ' — ¡Próximo descanso largo!' : ''}
                </Text>
              </View>
            </View>
          </>
        )}

        {!isModerator && (
          <View style={styles.participantInfo}>
            <Text style={styles.participantText}>
              Como participante, puedes ver el temporizador sincronizado pero no controlarlo.
            </Text>
          </View>
        )}
      </View>

      {/* Modal de configuración */}
      <TimerConfig
        visible={configVisible}
        onClose={() => setConfigVisible(false)}
        onSave={handleSaveConfig}
        currentEstudio={timerState?.duracion_estudio_siguiente ?? 25}
        currentDescanso={timerState?.duracion_descanso_siguiente ?? 5}
        currentDescansoLargo={timerState?.duracion_descanso_largo_siguiente ?? 30}
        currentCiclosAntesLargo={timerState?.ciclos_antes_descanso_largo_siguiente ?? 4}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
  infoContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  infoRow: {
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phaseIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textRoomsSecondary,
    flex: 1,
  },
  participantInfo: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  participantText: {
    fontSize: 11,
    color: COLORS.textRoomsTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default TimerTab;
