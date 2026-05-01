import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../styles';

const TimerControls = ({
  status,
  isModerator,
  onStart,
  onPause,
  onResume,
  onReset,
  loading = false,
}) => {
  const [actionLoading, setActionLoading] = useState('');

  const handleAction = async (action, actionFn) => {
    try {
      setActionLoading(action);
      await actionFn();
    } catch (error) {
      console.error(`Error in ${action}:`, error);
      // Aquí podrías mostrar un toast o alerta
    } finally {
      setActionLoading('');
    }
  };

  const isStopped = !status || status === 'stopped';
  const isActive = status === 'activo';
  const isPaused = status === 'pausado';

  if (!isModerator) {
    return (
      <View style={styles.nonModeratorContainer}>
        <Ionicons 
          name="lock-closed" 
          size={20} 
          color={COLORS.textRoomsTertiary} 
        />
        <Text style={styles.nonModeratorText}>
          Solo el moderador puede controlar el temporizador
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Contenedor de botones */}
      <View style={styles.buttonsContainer}>
        {/* Botón principal (Iniciar/Pausar/Reanudar) */}
        <TouchableOpacity
          style={[
            styles.primaryButton,
            isStopped && styles.startButton,
            isActive && styles.pauseButton,
            isPaused && styles.resumeButton,
          ]}
          onPress={() => {
            if (isStopped) {
              handleAction('start', onStart);
            } else if (isActive) {
              handleAction('pause', onPause);
            } else if (isPaused) {
              handleAction('resume', onResume);
            }
          }}
          disabled={loading || actionLoading !== ''}
        >
          {actionLoading === 'start' || actionLoading === 'pause' || actionLoading === 'resume' ? (
            <ActivityIndicator color={COLORS.textWhite} size="small" />
          ) : (
            <Ionicons
              name={
                isStopped ? 'play' : isActive ? 'pause' : 'play'
              }
              size={28}
              color={COLORS.textWhite}
            />
          )}
        </TouchableOpacity>

        {/* Botón secundario (Reiniciar) */}
        {!isStopped && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => handleAction('reset', onReset)}
            disabled={loading || actionLoading !== ''}
          >
            {actionLoading === 'reset' ? (
              <ActivityIndicator color={COLORS.primary} size="small" />
            ) : (
              <Ionicons
                name="refresh"
                size={22}
                color={COLORS.primary}
              />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Indicador de estado */}
      <View style={styles.statusContainer}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 12,
  },
  primaryButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  startButton: {
    backgroundColor: COLORS.primary,
  },
  pauseButton: {
    backgroundColor: COLORS.warning,
  },
  resumeButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
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
    textAlign: 'center',
  },
  nonModeratorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  nonModeratorText: {
    fontSize: 12,
    color: COLORS.textRoomsTertiary,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default TimerControls;
