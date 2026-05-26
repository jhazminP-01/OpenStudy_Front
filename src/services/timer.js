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
        .maybeSingle();

      if (participationError || !participation) {
        return { data: null, error: { message: 'No estás en esta sala' } };
      }

      if (participation.rol !== 'moderador') {
        return { data: null, error: { message: 'Solo el moderador puede iniciar el temporizador' } };
      }

      // 2. Verificar si ya existe un estado de timer
      const { data: existingTimer, error: timerError } = await supabase
        .from('pomodoro_estado')
        .select('*')
        .eq('sala_id', roomId)
        .single();

      if (timerError && timerError.code !== 'PGRST116') {
        throw timerError;
      }

      // 3. Leer configuración de la sala
      const { data: sala } = await supabase
        .from('sala')
        .select('config_duracion_estudio, config_duracion_descanso, config_duracion_descanso_largo, config_ciclos_antes_largo')
        .eq('id', roomId)
        .single();

      // 4. Resolver duraciones (config > _siguiente > sala.config_* > defaults)
      // Si el timer está pausado/detenido, usar _siguiente para aplicar nueva config
      const useNextValues = !existingTimer || existingTimer.estado === 'pausado' || existingTimer.estado === 'finalizado';

      const workMinutes = config.workMinutes
        ?? (useNextValues
          ? (existingTimer?.duracion_estudio_siguiente ?? sala?.config_duracion_estudio ?? TIMER_DEFAULTS.WORK_MINUTES)
          : (existingTimer?.duracion_estudio ?? sala?.config_duracion_estudio ?? TIMER_DEFAULTS.WORK_MINUTES));
      const breakMinutes = config.breakMinutes
        ?? (useNextValues
          ? (existingTimer?.duracion_descanso_siguiente ?? sala?.config_duracion_descanso ?? TIMER_DEFAULTS.BREAK_MINUTES)
          : (existingTimer?.duracion_descanso ?? sala?.config_duracion_descanso ?? TIMER_DEFAULTS.BREAK_MINUTES));
      const longBreakMinutes = config.longBreakMinutes
        ?? (useNextValues
          ? (existingTimer?.duracion_descanso_largo_siguiente ?? sala?.config_duracion_descanso_largo ?? TIMER_DEFAULTS.LONG_BREAK_MINUTES)
          : (existingTimer?.duracion_descanso_largo ?? sala?.config_duracion_descanso_largo ?? TIMER_DEFAULTS.LONG_BREAK_MINUTES));
      const cyclesBeforeLong = config.cyclesBeforeLong
        ?? (useNextValues
          ? (existingTimer?.ciclos_antes_descanso_largo_siguiente ?? sala?.config_ciclos_antes_largo ?? TIMER_DEFAULTS.CYCLES_BEFORE_LONG_BREAK)
          : (existingTimer?.ciclos_antes_descanso_largo ?? sala?.config_ciclos_antes_largo ?? TIMER_DEFAULTS.CYCLES_BEFORE_LONG_BREAK));

      const now = new Date().toISOString();
      const timeInSeconds = workMinutes * 60;

      let result;
      if (existingTimer) {
        // 5a. Reiniciar timer existente aplicando valores _siguiente
        const { data, error } = await supabase
          .from('pomodoro_estado')
          .update({
            fase: 'estudio',
            estado: 'activo',
            duracion_estudio: workMinutes,
            duracion_descanso: breakMinutes,
            duracion_descanso_largo: longBreakMinutes,
            ciclos_antes_descanso_largo: cyclesBeforeLong,
            ciclos_completados: 0,
            tiempo_restante: timeInSeconds,
            iniciado_en: now,
            updated_at: now,
          })
          .eq('sala_id', roomId)
          .select('*')
          .single();

        result = { data, error };
      } else {
        // 5b. Crear nuevo timer copiando config de sala
        const { data, error } = await supabase
          .from('pomodoro_estado')
          .insert({
            sala_id: roomId,
            fase: 'estudio',
            estado: 'activo',
            duracion_estudio: workMinutes,
            duracion_descanso: breakMinutes,
            duracion_descanso_largo: longBreakMinutes,
            ciclos_antes_descanso_largo: cyclesBeforeLong,
            duracion_estudio_siguiente: workMinutes,
            duracion_descanso_siguiente: breakMinutes,
            duracion_descanso_largo_siguiente: longBreakMinutes,
            ciclos_antes_descanso_largo_siguiente: cyclesBeforeLong,
            ciclos_completados: 0,
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
        .maybeSingle();

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
        .maybeSingle();

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
        .maybeSingle();

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
      const duration = currentTimer.fase === 'estudio'
        ? currentTimer.duracion_estudio_siguiente ?? currentTimer.duracion_estudio
        : currentTimer.fase === 'descanso_largo'
          ? currentTimer.duracion_descanso_largo_siguiente ?? currentTimer.duracion_descanso_largo
          : currentTimer.duracion_descanso_siguiente ?? currentTimer.duracion_descanso;
      const timeInSeconds = duration * 60;

      const updatePayload = {
        estado: 'activo',
        tiempo_restante: timeInSeconds,
        iniciado_en: now,
        updated_at: now,
      };

      // Aplicar valores _siguiente a los campos principales
      if (currentTimer.duracion_estudio_siguiente) {
        updatePayload.duracion_estudio = currentTimer.duracion_estudio_siguiente;
      }
      if (currentTimer.duracion_descanso_siguiente) {
        updatePayload.duracion_descanso = currentTimer.duracion_descanso_siguiente;
      }
      if (currentTimer.duracion_descanso_largo_siguiente) {
        updatePayload.duracion_descanso_largo = currentTimer.duracion_descanso_largo_siguiente;
      }
      if (currentTimer.ciclos_antes_descanso_largo_siguiente) {
        updatePayload.ciclos_antes_descanso_largo = currentTimer.ciclos_antes_descanso_largo_siguiente;
      }

      const { data, error } = await supabase
        .from('pomodoro_estado')
        .update(updatePayload)
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
   * Actualizar configuración del temporizador (aplica al siguiente ciclo)
   * @param {number} roomId - ID de la sala (bigint)
   * @param {string} userId - ID del usuario (uuid) - debe ser moderador
   * @param {number} estudio - Duración de estudio en minutos (5-60)
   * @param {number} descanso - Duración de descanso en minutos (1-60)
   * @returns {Promise<{data: object, error: Error}>}
   */
  updateTimerConfig: async (roomId, userId, { estudio, descanso, descansoLargo, ciclosAntesLargo }) => {
    try {
      // Verificar que el usuario es moderador
      const { data: participation, error: participationError } = await supabase
        .from('participacion')
        .select('rol')
        .eq('sala_id', roomId)
        .eq('usuario_id', userId)
        .eq('estado_conexion', 'activo')
        .eq('esta_expulsado', false)
        .maybeSingle();

      if (participationError || !participation || participation.rol !== 'moderador') {
        return { data: null, error: { message: 'Solo el moderador puede configurar el temporizador' } };
      }

      // Validar rangos
      const estudioVal = parseInt(estudio);
      const descansoVal = parseInt(descanso);
      const descansoLargoVal = parseInt(descansoLargo);
      const ciclosVal = parseInt(ciclosAntesLargo);

      if (isNaN(estudioVal) || estudioVal < 5 || estudioVal > 60)
        return { data: null, error: { message: 'Estudio: entre 5 y 60 minutos' } };
      if (isNaN(descansoVal) || descansoVal < 1 || descansoVal > 60)
        return { data: null, error: { message: 'Descanso: entre 1 y 60 minutos' } };
      if (isNaN(descansoLargoVal) || descansoLargoVal < 5 || descansoLargoVal > 60)
        return { data: null, error: { message: 'Descanso largo: entre 5 y 60 minutos' } };
      if (isNaN(ciclosVal) || ciclosVal < 1 || ciclosVal > 8)
        return { data: null, error: { message: 'Ciclos antes del descanso largo: entre 1 y 8' } };

      const now = new Date().toISOString();

      // Actualizar sala.config_* (fuente de verdad para nuevas sesiones)
      const { error: salaError } = await supabase
        .from('sala')
        .update({
          config_duracion_estudio: estudioVal,
          config_duracion_descanso: descansoVal,
          config_duracion_descanso_largo: descansoLargoVal,
          config_ciclos_antes_largo: ciclosVal,
        })
        .eq('id', roomId);

      if (salaError) {
        console.error('Error updating sala config:', salaError);
        return { data: null, error: salaError };
      }

      // Actualizar pomodoro_estado.*_siguiente (para la sesión actual)
      const { data: existingTimer } = await supabase
        .from('pomodoro_estado')
        .select('id')
        .eq('sala_id', roomId)
        .single();

      let result;
      if (existingTimer) {
        result = await supabase
          .from('pomodoro_estado')
          .update({
            duracion_estudio_siguiente: estudioVal,
            duracion_descanso_siguiente: descansoVal,
            duracion_descanso_largo_siguiente: descansoLargoVal,
            ciclos_antes_descanso_largo_siguiente: ciclosVal,
            updated_at: now,
          })
          .eq('sala_id', roomId)
          .select('*')
          .single();
      } else {
        result = await supabase
          .from('pomodoro_estado')
          .insert({
            sala_id: roomId,
            duracion_estudio_siguiente: estudioVal,
            duracion_descanso_siguiente: descansoVal,
            duracion_descanso_largo_siguiente: descansoLargoVal,
            ciclos_antes_descanso_largo_siguiente: ciclosVal,
          })
          .select('*')
          .single();
      }

      if (result.error) throw result.error;

      // Emitir evento realtime
      const channel = supabase.channel(`pomodoro:${roomId}`);
      channel.send({
        type: 'broadcast',
        event: 'timer_config_updated',
        payload: result.data,
      });

      return { data: result.data, error: null };

    } catch (error) {
      console.error('Error updating timer config:', error);
      return { data: null, error };
    }
  },

  /**
   * Completar un ciclo y transicionar a la siguiente fase
   * Solo debe llamarlo el moderador cuando el timer llega a 0
   * @param {number} roomId - ID de la sala
   * @param {string} userId - ID del usuario moderador
   */
  completeCycle: async (roomId, userId) => {
    try {
      const now = new Date().toISOString();

      const { data: currentTimer, error: timerError } = await supabase
        .from('pomodoro_estado')
        .select('*')
        .eq('sala_id', roomId)
        .single();

      if (timerError || !currentTimer) {
        return { data: null, error: { message: 'No hay temporizador activo' } };
      }

      const wasStudy = currentTimer.fase === 'estudio';
      const wasDescanso = currentTimer.fase === 'descanso';
      const wasLong = currentTimer.fase === 'descanso_largo';

      // Insertar sesión completada para todos los participantes activos (solo en fase estudio)
      if (wasStudy) {
        const expectedDuration = currentTimer.duracion_estudio;

        // Obtener todos los participantes activos de la sala
        const { data: participants, error: participantsError } = await supabase
          .from('participacion')
          .select('usuario_id')
          .eq('sala_id', roomId)
          .eq('estado_conexion', 'activo')
          .eq('esta_expulsado', false);

        if (!participantsError && participants && participants.length > 0) {
          // Preparar registros para insertar en bulk
          const sesiones = participants.map((p) => ({
            sala_id: roomId,
            usuario_id: p.usuario_id,
            duracion: expectedDuration,
            completada: true,
          }));

          await supabase.from('sesion_pomodoro').insert(sesiones);
        }
      }

      // Calcular siguiente fase
      let nextFase;
      let nextTiempo;
      let nuevosCiclos = currentTimer.ciclos_completados;
      const applyNext = wasDescanso || wasLong;

      if (wasStudy) {
        nuevosCiclos += 1;
        if (nuevosCiclos >= currentTimer.ciclos_antes_descanso_largo) {
          nextFase = 'descanso_largo';
          nextTiempo = (currentTimer.duracion_descanso_largo_siguiente ?? currentTimer.duracion_descanso_largo) * 60;
        } else {
          nextFase = 'descanso';
          nextTiempo = currentTimer.duracion_descanso_siguiente * 60;
        }
      } else {
        nextFase = 'estudio';
        nextTiempo = (currentTimer.duracion_estudio_siguiente ?? currentTimer.duracion_estudio) * 60;
        if (wasLong) nuevosCiclos = 0;
      }

      // Construir payload de actualización
      const updatePayload = {
        fase: nextFase,
        estado: 'activo',
        ciclos_completados: nuevosCiclos,
        tiempo_restante: nextTiempo,
        iniciado_en: now,
        updated_at: now,
      };

      // Aplicar valores _siguiente cuando se vuelve a estudio
      if (applyNext) {
        updatePayload.duracion_estudio = currentTimer.duracion_estudio_siguiente;
        updatePayload.duracion_descanso = currentTimer.duracion_descanso_siguiente;
        updatePayload.duracion_descanso_largo = currentTimer.duracion_descanso_largo_siguiente ?? currentTimer.duracion_descanso_largo;
        updatePayload.ciclos_antes_descanso_largo = currentTimer.ciclos_antes_descanso_largo_siguiente ?? currentTimer.ciclos_antes_descanso_largo;
      }

      const { data, error } = await supabase
        .from('pomodoro_estado')
        .update(updatePayload)
        .eq('sala_id', roomId)
        .select('*')
        .single();

      if (error) throw error;

      // Emitir evento realtime
      const channel = supabase.channel(`pomodoro:${roomId}`);
      channel.send({
        type: 'broadcast',
        event: 'timer_cycle_completed',
        payload: { timerState: data, completedPhase: currentTimer.fase },
      });

      return { data, error: null };

    } catch (error) {
      console.error('Error completing cycle:', error);
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
      .on('broadcast', { event: 'timer_config_updated' }, (payload) => {
        callback({ type: 'timer_config_updated', payload: payload.payload });
      })
      .on('broadcast', { event: 'timer_cycle_completed' }, (payload) => {
        callback({ type: 'timer_cycle_completed', payload: payload.payload });
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
