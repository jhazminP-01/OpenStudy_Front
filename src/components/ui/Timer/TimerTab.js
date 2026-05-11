import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTimer } from '../../../hooks/useTimer';
import TimerDisplay from './TimerDisplay';
import TimerControls from './TimerControls';
import TimerVideo from './TimerVideo';
import { COLORS } from '../../../styles';

const TimerTab = ({ roomId }) => {
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
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
  } = useTimer(roomId);

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

      {/* Video animado debajo del timer */}
      <TimerVideo size={140} />

      {/* Controles del temporizador */}
      <TimerControls
        status={status}
        isModerator={isModerator}
        onStart={startTimer}
        onPause={pauseTimer}
        onResume={resumeTimer}
        onReset={resetTimer}
        loading={loading}
      />

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
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoText}>
                Ciclo actual: {timerState.duracion_estudio}min estudio / {timerState.duracion_descanso}min descanso
              </Text>
            </View>
          </View>
        )}

        {!isModerator && (
          <View style={styles.participantInfo}>
            <Text style={styles.participantText}>
              Como participante, puedes ver el temporizador sincronizado pero no controlarlo.
            </Text>
          </View>
        )}
      </View>
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
