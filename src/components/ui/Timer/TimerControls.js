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
  onSkip,
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

  // Si no es moderador y el timer no está pausado, no mostrar controles
  if (!isModerator && !isPaused) return null;

  return (
    <View style={styles.container}>
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
            name={isStopped ? 'play' : isActive ? 'pause' : 'play'}
            size={24}
            color={COLORS.textWhite}
          />
        )}
      </TouchableOpacity>

      {/* Botón reiniciar (solo moderador) */}
      {!isStopped && isModerator && (
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => handleAction('reset', onReset)}
          disabled={loading || actionLoading !== ''}
        >
          {actionLoading === 'reset' ? (
            <ActivityIndicator color={COLORS.primary} size="small" />
          ) : (
            <Ionicons name="refresh" size={18} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      )}

      {/* Botón saltar fase (solo para pruebas) */}
      {isActive && onSkip && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => handleAction('skip', onSkip)}
          disabled={loading || actionLoading !== ''}
        >
          {actionLoading === 'skip' ? (
            <ActivityIndicator color={COLORS.warning} size="small" />
          ) : (
            <Ionicons name="play-skip-forward-outline" size={18} color={COLORS.warning} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },

  skipButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.warning,
    backgroundColor: 'transparent',
  },
});

export default TimerControls;
