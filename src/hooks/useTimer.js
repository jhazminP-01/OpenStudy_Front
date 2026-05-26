import { useState, useEffect, useCallback, useRef } from 'react';
import { timerService } from '../services/timer';
import { useAuth } from './useAuth';
import { TIMER_STATUSES, TIMER_DEFAULTS } from '../utils/constants';
import { supabase } from '../../lib/supabase';

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
  const [cycleHistory, setCycleHistory] = useState([]);
  const subscriptionRef = useRef(null);
  const intervalRef = useRef(null);
  const isModeratorRef = useRef(false);
  const userIdRef = useRef(user?.id);
  const cycleCompletingRef = useRef(false);

  // Mantener refs actualizadas para evitar stale closures en el countdown
  useEffect(() => { isModeratorRef.current = isModerator; }, [isModerator]);
  useEffect(() => { userIdRef.current = user?.id; }, [user?.id]);

  // Cargar historial de ciclos desde sesion_pomodoro
  const loadCycleHistory = useCallback(async () => {
    if (!roomId) return;
    try {
      const { data } = await supabase
        .from('sesion_pomodoro')
        .select('duracion, completada, created_at')
        .eq('sala_id', roomId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (data && data.length > 0) {
        const history = data.map((item) => ({
          id: item.created_at,
          phase: 'estudio',
          time: new Date(item.created_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
          duracion: item.duracion,
        }));
        setCycleHistory(history);
      }
    } catch (_) {}
  }, [roomId]);

  useEffect(() => {
    loadCycleHistory();
  }, [loadCycleHistory]);

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
          .maybeSingle();

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
        // Si está pausado, mostrar el tiempo de la nueva config (_siguiente) como preview
        if (timerData.estado === 'pausado' && timerData.duracion_estudio_siguiente) {
          setTimeLeft(timerData.duracion_estudio_siguiente * 60);
        } else {
          const calculatedTimeLeft = timerService.calculateTimeLeft(timerData);
          setTimeLeft(calculatedTimeLeft);
        }
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
          // Solo actualizar timeLeft si el timer está activo
          // Si está pausado, los eventos broadcast ya manejan timeLeft correctamente
          // y evitamos sobreescribir el preview visual de la nueva configuración
          if (payload.new.estado === 'activo') {
            const calculatedTimeLeft = timerService.calculateTimeLeft(payload.new);
            setTimeLeft(calculatedTimeLeft);
          }
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

      case 'timer_config_updated':
        setTimerState(prev => prev ? { ...prev, ...payload } : payload);
        // Actualizar preview del tiempo para todos los usuarios
        if (payload.duracion_estudio_siguiente) {
          setTimeLeft(payload.duracion_estudio_siguiente * 60);
        }
        break;

      case 'timer_cycle_completed': {
        const cycleState = payload.timerState;
        setTimerState(cycleState);
        const cycleTimeLeft = timerService.calculateTimeLeft(cycleState);
        setTimeLeft(cycleTimeLeft);
        break;
      }
    }
  }, []);

  // Countdown local con corrección de drift
  useEffect(() => {
    // Limpiar intervalo anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (timerState?.estado === 'activo' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1;

          if (newTime <= 0) {
            // Solo el moderador dispara la transición de ciclo
            if (isModeratorRef.current && !cycleCompletingRef.current) {
              cycleCompletingRef.current = true;
              setTimeout(() => {
                timerService.completeCycle(roomId, userIdRef.current)
                  .finally(() => { cycleCompletingRef.current = false; });
              }, 0);
            }
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
  }, [timerState?.estado, timeLeft, roomId]);

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

  const updateConfig = useCallback(async ({ estudio, descanso, descansoLargo, ciclosAntesLargo }) => {
    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    const { data, error } = await timerService.updateTimerConfig(
      roomId, user.id, { estudio, descanso, descansoLargo, ciclosAntesLargo }
    );

    if (error) {
      throw error;
    }

    // Actualizar preview local del tiempo si el timer no está corriendo activamente
    if (!isModeratorRef.current || timerState?.estado !== 'activo') {
      setTimeLeft(parseInt(estudio) * 60);
    }

    return data;
  }, [roomId, user?.id, timerState?.estado]);

  const completeCycle = useCallback(async () => {
    if (!user?.id) return;
    const { data, error } = await timerService.completeCycle(roomId, user.id);
    if (error) console.error('Error completing cycle:', error);
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
  const isLongBreakPhase = phase === 'descanso_largo';
  const ciclosCompletados = timerState?.ciclos_completados ?? 0;
  const ciclosParaDescansoLargo = timerState?.ciclos_antes_descanso_largo ?? TIMER_DEFAULTS.CYCLES_BEFORE_LONG_BREAK;

  // Formato de tiempo
  const formattedTime = timerService.formatTime(timeLeft);
  const totalDuration = timerState?.fase === 'estudio'
    ? timerState.duracion_estudio
    : timerState?.fase === 'descanso_largo'
      ? timerState.duracion_descanso_largo
      : timerState?.duracion_descanso;
  const progress = timerState ? (totalDuration * 60 - timeLeft) / (totalDuration * 60) * 100 : 0;

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
    isLongBreakPhase,
    ciclosCompletados,
    ciclosParaDescansoLargo,
    
    // Funciones de control
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    updateConfig,
    completeCycle,
    loadCycleHistory,
    
    // Historial
    cycleHistory,
    addToCycleHistory: (phase) => {
      const now = new Date();
      setCycleHistory((prev) => [{
        id: `${now.getTime()}-${Math.random()}`,
        phase,
        time: now.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
      }, ...prev].slice(0, 10));
    },
    
    // Utilidades
    formatTime: timerService.formatTime,
  };
};

export default useTimer;
