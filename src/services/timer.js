import { supabase } from '../../lib/supabase';
import { TIMER_DEFAULTS, TIMER_STATUSES } from '../utils/constants';

/**
 * Servicio para manejar el temporizador Pomodoro en las salas
 * HU-08: Iniciar temporizador Pomodoro
 * HU-09: Configurar y controlar el Pomodoro
 */
export const timerService = {
  /**
   * Iniciar el temporizador Pomodoro
   * @param {number} roomId - ID de la sala (bigint)
   * @param {string} userId - ID del usuario (uuid) - debe ser moderador
   * @param {object} config - Configuración opcional
   * @param {number} config.workMinutes - Minutos de estudio (default: 25)
   * @param {number} config.breakMinutes - Minutos de descanso (default: 5)
   * @returns {Promise<{data: object, error: Error}>}
   */
  startTimer: async (roomId, userId, config = {}) => {
    try {
      // 1. Verificar que el usuario es moderador
      const { data: participation, error: participationError } = await supabase
        .from('participacion')
        .select('rol')
        .eq('sala_id', roomId)
        .eq('usuario_id', userId)
        .eq('estado_conexion', 'activo')
        .eq('esta_expulsado', false)
        .single();

      if (participationError || !participation) {
        return { data: null, error: { message: 'No estás en esta sala' } };
      }

      if (participation.rol !== 'moderador') {
        return { data: null, error: { message: 'Solo el moderador puede iniciar el temporizador' } };
      }

      // 2. Configuración por defecto
      const workMinutes = config.workMinutes || TIMER_DEFAULTS.WORK_MINUTES;
      const breakMinutes = config.breakMinutes || TIMER_DEFAULTS.BREAK_MINUTES;

      // 3. Verificar si ya existe un estado de timer
      const { data: existingTimer, error: timerError } = await supabase
        .from('pomodoro_estado')
        .select('*')
        .eq('sala_id', roomId)
        .single();

      if (timerError && timerError.code !== 'PGRST116') {
        // Error real (no es "not found")
        throw timerError;
      }

      const now = new Date().toISOString();
      const timeInSeconds = workMinutes * 60;

      let result;
      if (existingTimer) {
        // 4a. Actualizar timer existente
        const { data, error } = await supabase
          .from('pomodoro_estado')
          .update({
            fase: 'estudio',
            estado: 'activo',
            duracion_estudio: workMinutes,
            duracion_descanso: breakMinutes,
            tiempo_restante: timeInSeconds,
            iniciado_en: now,
            updated_at: now,
          })
          .eq('sala_id', roomId)
          .select('*')
          .single();

        result = { data, error };
      } else {
        // 4b. Crear nuevo timer
        const { data, error } = await supabase
          .from('pomodoro_estado')
          .insert({
            sala_id: roomId,
            fase: 'estudio',
            estado: 'activo',
            duracion_estudio: workMinutes,
            duracion_descanso: breakMinutes,
            duracion_estudio_siguiente: workMinutes,
            duracion_descanso_siguiente: breakMinutes,
            tiempo_restante: timeInSeconds,
            iniciado_en: now,
          })
          .select()
          .single();

        result = { data, error };
      }

      if (result.error) throw result.error;

      // 5. Emitir evento realtime
      const channel = supabase.channel(`pomodoro:${roomId}`);
      channel.send({
        type: 'broadcast',
        event: 'timer_started',
        payload: result.data,
      });

      return { data: result.data, error: null };

    } catch (error) {
      console.error('Error starting timer:', error);
      return { data: null, error };
    }
  },

  /**
   * Pausar el temporizador
   * @param {number} roomId - ID de la sala (bigint)
   * @param {string} userId - ID del usuario (uuid) - debe ser moderador
   * @returns {Promise<{data: object, error: Error}>}
   */
  pauseTimer: async (roomId, userId) => {
    try {
      // Verificar rol moderador
      const { data: participation, error: participationError } = await supabase
        .from('participacion')
        .select('rol')
        .eq('sala_id', roomId)
        .eq('usuario_id', userId)
        .eq('estado_conexion', 'activo')
        .eq('esta_expulsado', false)
        .single();

      if (participationError || !participation || participation.rol !== 'moderador') {
        return { data: null, error: { message: 'Solo el moderador puede pausar el temporizador' } };
      }

      const now = new Date().toISOString();
      
      // Calcular tiempo restante actual
      const { data: currentTimer, error: timerError } = await supabase
        .from('pomodoro_estado')
        .select('*')
        .eq('sala_id', roomId)
        .single();

      if (timerError || !currentTimer) {
        return { data: null, error: { message: 'No hay temporizador activo' } };
      }

      const elapsedMs = new Date(now) - new Date(currentTimer.iniciado_en);
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      const remainingTime = Math.max(0, currentTimer.tiempo_restante - elapsedSeconds);

      const { data, error } = await supabase
        .from('pomodoro_estado')
        .update({
          estado: 'pausado',
          tiempo_restante: remainingTime,
          updated_at: now,
        })
        .eq('sala_id', roomId)
        .select('*')
        .single();

      if (error) throw error;

      // Emitir evento realtime
      const channel = supabase.channel(`pomodoro:${roomId}`);
      channel.send({
        type: 'broadcast',
        event: 'timer_paused',
        payload: data,
      });

      return { data, error: null };

    } catch (error) {
      console.error('Error pausing timer:', error);
      return { data: null, error };
    }
  },

  /**
   * Reanudar el temporizador
   * @param {number} roomId - ID de la sala (bigint)
   * @param {string} userId - ID del usuario (uuid) - debe ser moderador
   * @returns {Promise<{data: object, error: Error}>}
   */
  resumeTimer: async (roomId, userId) => {
    try {
      // Verificar rol moderador
      const { data: participation, error: participationError } = await supabase
        .from('participacion')
        .select('rol')
        .eq('sala_id', roomId)
        .eq('usuario_id', userId)
        .eq('estado_conexion', 'activo')
        .eq('esta_expulsado', false)
        .single();

      if (participationError || !participation || participation.rol !== 'moderador') {
        return { data: null, error: { message: 'Solo el moderador puede reanudar el temporizador' } };
      }

      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('pomodoro_estado')
        .update({
          estado: 'activo',
          iniciado_en: now,
          updated_at: now,
        })
        .eq('sala_id', roomId)
        .eq('estado', 'pausado')
        .select('*')
        .single();

      if (error) throw error;

      // Emitir evento realtime
      const channel = supabase.channel(`pomodoro:${roomId}`);
      channel.send({
        type: 'broadcast',
        event: 'timer_resumed',
        payload: data,
      });

      return { data, error: null };

    } catch (error) {
      console.error('Error resuming timer:', error);
      return { data: null, error };
    }
  },

  /**
   * Reiniciar el temporizador al ciclo actual
   * @param {number} roomId - ID de la sala (bigint)
   * @param {string} userId - ID del usuario (uuid) - debe ser moderador
   * @returns {Promise<{data: object, error: Error}>}
   */
  resetTimer: async (roomId, userId) => {
    try {
      // Verificar rol moderador
      const { data: participation, error: participationError } = await supabase
        .from('participacion')
        .select('rol')
        .eq('sala_id', roomId)
        .eq('usuario_id', userId)
        .eq('estado_conexion', 'activo')
        .eq('esta_expulsado', false)
        .single();

      if (participationError || !participation || participation.rol !== 'moderador') {
        return { data: null, error: { message: 'Solo el moderador puede reiniciar el temporizador' } };
      }

      // Obtener timer actual para saber en qué fase estamos
      const { data: currentTimer, error: timerError } = await supabase
        .from('pomodoro_estado')
        .select('*')
        .eq('sala_id', roomId)
        .single();

      if (timerError || !currentTimer) {
        return { data: null, error: { message: 'No hay temporizador activo' } };
      }

      const now = new Date().toISOString();
      const isStudyPhase = currentTimer.fase === 'estudio';
      const duration = isStudyPhase ? currentTimer.duracion_estudio : currentTimer.duracion_descanso;
      const timeInSeconds = duration * 60;

      const { data, error } = await supabase
        .from('pomodoro_estado')
        .update({
          estado: 'activo',
          tiempo_restante: timeInSeconds,
          iniciado_en: now,
          updated_at: now,
        })
        .eq('sala_id', roomId)
        .select('*')
        .single();

      if (error) throw error;

      // Emitir evento realtime
      const channel = supabase.channel(`pomodoro:${roomId}`);
      channel.send({
        type: 'broadcast',
        event: 'timer_reset',
        payload: data,
      });

      return { data, error: null };

    } catch (error) {
      console.error('Error resetting timer:', error);
      return { data: null, error };
    }
  },

  /**
   * Obtener estado actual del temporizador
   * @param {number} roomId - ID de la sala (bigint)
   * @returns {Promise<{data: object, error: Error}>}
   */
  getTimerState: async (roomId) => {
    try {
      const { data, error } = await supabase
        .from('pomodoro_estado')
        .select('*')
        .eq('sala_id', roomId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No hay timer - es normal
        return { data: null, error: null };
      }

      if (error) {
        // Si la tabla no existe (406), retornar null silenciosamente
        if (error.code === '406' || error.message?.includes('406')) {
          console.warn('Tabla pomodoro_estado no existe - timer deshabilitado');
          return { data: null, error: null };
        }
        throw error;
      }

      return { data, error: null };

    } catch (error) {
      console.error('Error getting timer state:', error);
      // Si es error 406, retornar null silenciosamente
      if (error.code === '406' || error.message?.includes('406')) {
        console.warn('Tabla pomodoro_estado no existe - timer deshabilitado');
        return { data: null, error: null };
      }
      return { data: null, error };
    }
  },

  /**
   * Suscribirse a actualizaciones en tiempo real del temporizador
   * @param {number} roomId - ID de la sala (bigint)
   * @param {function} callback - Función a llamar cuando hay cambios
   * @returns {object} Canal de suscripción
   */
  subscribeToTimer: (roomId, callback) => {
    // Suscripción a cambios en la tabla pomodoro_estado
    const dbChannel = supabase
      .channel(`pomodoro_estado:sala_id=eq.${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pomodoro_estado',
          filter: `sala_id=eq.${roomId}`,
        },
        (payload) => {
          callback({ type: 'db_change', payload });
        }
      )
      .subscribe();

    // Suscripción a eventos broadcast
    const broadcastChannel = supabase
      .channel(`pomodoro:${roomId}`)
      .on('broadcast', { event: 'timer_started' }, (payload) => {
        callback({ type: 'timer_started', payload: payload.payload });
      })
      .on('broadcast', { event: 'timer_paused' }, (payload) => {
        callback({ type: 'timer_paused', payload: payload.payload });
      })
      .on('broadcast', { event: 'timer_resumed' }, (payload) => {
        callback({ type: 'timer_resumed', payload: payload.payload });
      })
      .on('broadcast', { event: 'timer_reset' }, (payload) => {
        callback({ type: 'timer_reset', payload: payload.payload });
      })
      .subscribe();

    // Retornar objeto con ambos canales para poder unsuscribir
    return {
      unsubscribe: () => {
        dbChannel.unsubscribe();
        broadcastChannel.unsubscribe();
      },
    };
  },

  /**
   * Formatear segundos a MM:SS
   * @param {number} seconds - Segundos
   * @returns {string} Formato MM:SS
   */
  formatTime: (seconds) => {
    const minutes = Math.floor(Math.abs(seconds) / 60);
    const remainingSeconds = Math.floor(Math.abs(seconds) % 60);
    const sign = seconds < 0 ? '-' : '';
    return `${sign}${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  /**
   * Calcular tiempo restante basado en tiempo del servidor
   * @param {object} timerState - Estado del temporizador
   * @returns {number} Segundos restantes
   */
  calculateTimeLeft: (timerState) => {
    if (!timerState || timerState.estado === 'finalizado') {
      return 0;
    }

    if (timerState.estado === 'pausado') {
      return timerState.tiempo_restante;
    }

    const now = new Date();
    const startedAt = new Date(timerState.iniciado_en);
    const elapsedSeconds = Math.floor((now - startedAt) / 1000);
    const timeLeft = timerState.tiempo_restante - elapsedSeconds;

    return Math.max(0, timeLeft);
  },
};

export default timerService;
