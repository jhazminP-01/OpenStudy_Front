import { useState, useEffect, useCallback, useRef } from 'react';
import { timerService } from '../services/timer';
import { useAuth } from './useAuth';
import { TIMER_STATUSES } from '../utils/constants';

/**
 * Hook personalizado para manejar el estado del temporizador Pomodoro
 * HU-08: Iniciar temporizador Pomodoro
 * HU-09: Configurar y controlar el Pomodoro
 */
export const useTimer = (roomId) => {
  const { user } = useAuth();
  const [timerState, setTimerState] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModerator, setIsModerator] = useState(false);
  const subscriptionRef = useRef(null);
  const intervalRef = useRef(null);

  // Cargar estado inicial del timer
  const loadTimerState = useCallback(async () => {
    try {
      setLoading(true);
      
      // Obtener estado del timer
      const { data: timerData, error: timerError } = await timerService.getTimerState(roomId);
      
      if (timerError) {
        console.error('Error loading timer state:', timerError);
        return;
      }

      // Verificar si el usuario es moderador
      if (user?.id && roomId) {
        const { supabase } = await import('../../lib/supabase');
        const { data: participation, error: participationError } = await supabase
          .from('participacion')
          .select('rol')
          .eq('sala_id', roomId)
          .eq('usuario_id', user.id)
          .eq('estado_conexion', 'activo')
          .eq('esta_expulsado', false)
          .single();

        // Si hay error 406 (tabla no existe) u otros errores, asumir que no es moderador
        if (participationError) {
          console.warn('Error al verificar rol moderador:', participationError.message);
          setIsModerator(false);
        } else {
          setIsModerator(participation?.rol === 'moderador');
        }
      }

      setTimerState(timerData);
      
      if (timerData) {
        const calculatedTimeLeft = timerService.calculateTimeLeft(timerData);
        setTimeLeft(calculatedTimeLeft);
      } else {
        setTimeLeft(0);
      }

    } catch (error) {
      console.error('Error loading timer state:', error);
    } finally {
      setLoading(false);
    }
  }, [roomId, user?.id]);

  // Configurar suscripción realtime
  const setupRealtimeSubscription = useCallback(() => {
    if (!roomId) return;

    subscriptionRef.current = timerService.subscribeToTimer(
      roomId,
      (event) => {
        handleRealtimeUpdate(event);
      }
    );
  }, [roomId]);

  // Manejar actualizaciones en tiempo real
  const handleRealtimeUpdate = useCallback((event) => {
    const { type, payload } = event;

    switch (type) {
      case 'db_change':
        // Cambios directos en la tabla
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          setTimerState(payload.new);
          const calculatedTimeLeft = timerService.calculateTimeLeft(payload.new);
          setTimeLeft(calculatedTimeLeft);
        }
        break;

      case 'timer_started':
      case 'timer_paused':
      case 'timer_resumed':
      case 'timer_reset':
        // Eventos broadcast
        setTimerState(payload);
        const calculatedTimeLeft = timerService.calculateTimeLeft(payload);
        setTimeLeft(calculatedTimeLeft);
        break;
    }
  }, []);

  // Countdown local con corrección de drift
  useEffect(() => {
    // Limpiar intervalo anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Solo correr countdown si el timer está activo
    if (timerState?.estado === 'activo' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1;
          
          // Si el tiempo llega a 0, verificar con el servidor
          if (newTime <= 0) {
            // Forzar sincronización con servidor
            loadTimerState();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState?.estado, timeLeft, loadTimerState]);

  // Sincronización periódica con servidor (cada 30 segundos)
  useEffect(() => {
    if (!timerState?.estado === 'activo') return;

    const syncInterval = setInterval(() => {
      loadTimerState();
    }, 30000); // 30 segundos

    return () => clearInterval(syncInterval);
  }, [timerState?.estado, loadTimerState]);

  // Inicializar
  useEffect(() => {
    loadTimerState();
    setupRealtimeSubscription();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadTimerState, setupRealtimeSubscription]);

  // Funciones de control
  const startTimer = useCallback(async (config = {}) => {
    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    const { data, error } = await timerService.startTimer(roomId, user.id, config);
    
    if (error) {
      throw error;
    }

    return data;
  }, [roomId, user?.id]);

  const pauseTimer = useCallback(async () => {
    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    const { data, error } = await timerService.pauseTimer(roomId, user.id);
    
    if (error) {
      throw error;
    }

    return data;
  }, [roomId, user?.id]);

  const resumeTimer = useCallback(async () => {
    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    const { data, error } = await timerService.resumeTimer(roomId, user.id);
    
    if (error) {
      throw error;
    }

    return data;
  }, [roomId, user?.id]);

  const resetTimer = useCallback(async () => {
    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    const { data, error } = await timerService.resetTimer(roomId, user.id);
    
    if (error) {
      throw error;
    }

    return data;
  }, [roomId, user?.id]);

  // Estados derivados
  const phase = timerState?.fase || 'estudio';
  const status = timerState?.estado || 'stopped';
  const isActive = status === 'activo';
  const isPaused = status === 'pausado';
  const isStopped = !timerState;
  const isStudyPhase = phase === 'estudio';
  const isBreakPhase = phase === 'descanso';

  // Formato de tiempo
  const formattedTime = timerService.formatTime(timeLeft);
  const progress = timerState ? 
    ((timerState.fase === 'estudio' ? timerState.duracion_estudio : timerState.duracion_descanso) * 60 - timeLeft) / 
    ((timerState.fase === 'estudio' ? timerState.duracion_estudio : timerState.duracion_descanso) * 60) * 100 
    : 0;

  return {
    // Estado
    timerState,
    timeLeft,
    formattedTime,
    phase,
    status,
    progress,
    loading,
    isModerator,
    
    // Estados booleanos
    isActive,
    isPaused,
    isStopped,
    isStudyPhase,
    isBreakPhase,
    
    // Funciones de control
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    
    // Utilidades
    formatTime: timerService.formatTime,
  };
};

export default useTimer;
