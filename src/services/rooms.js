import { supabase } from '../../lib/supabase';

const generateInvitationCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const roomsService = {
  // Obtener salas activas
  getRooms: async (filters = {}) => {
      let query = supabase
        .from('sala')
        .select(`
          *,
          materia (
            id,
            nombre
          ),
          participacion (
            id,
            usuario_id,
            rol,
            estado_conexion,
            esta_expulsado,
            fecha_ingreso
          ),
          pomodoro_estado (
            fase,
            estado
          )
        `)
        .eq('estado', 'activa')
        .order('created_at', { ascending: false });

      if (filters.materia_id) {
        query = query.eq('materia_id', filters.materia_id);
      }

      const { data, error } = await query;

      return { data, error };
  },

  // Obtener salas inactivas
  getInactiveRooms: async (filters = {}) => {
      let query = supabase
        .from('sala')
        .select(`
          *,
          materia (
            id,
            nombre
          ),
          participacion (
            id,
            usuario_id,
            rol,
            estado_conexion,
            esta_expulsado,
            fecha_ingreso
          )
        `)
        .eq('estado', 'inactiva')
        .order('created_at', { ascending: false });

      if (filters.materia_id) {
        query = query.eq('materia_id', filters.materia_id);
      }

      const { data, error } = await query;

      return { data, error };
  },

  // Obtener materias
  getMaterias: async () => {
    const { data, error } = await supabase
      .from('materia')
      .select('*')
      .order('nombre', { ascending: true });

    return { data, error };
  },

  // Crear sala
  createRoom: async (roomData, userId) => {
    const codigoInvitacion = generateInvitationCode();

    const { data, error } = await supabase
      .from('sala')
      .insert({
        nombre: roomData.nombre,
        descripcion: roomData.descripcion || '',
        materia_id: roomData.materia_id,
        estado: 'activa',
        capacidad_maxima: roomData.capacidad_maxima,
        creador_id: userId,
        codigo_invitacion: codigoInvitacion,
      })
      .select()
      .maybeSingle();

    if (error) {
      return { data: null, error };
    }

    // Verificar si ya existe participación para evitar duplicados (React Strict Mode)
    const { data: existingParticipation } = await supabase
      .from('participacion')
      .select('id')
      .eq('sala_id', data.id)
      .eq('usuario_id', userId)
      .maybeSingle();

    if (!existingParticipation) {
      const { error: participationError } = await supabase
        .from('participacion')
        .insert({
          usuario_id: userId,
          sala_id: data.id,
          rol: 'moderador',
          estado_conexion: 'activo',
          esta_expulsado: false,
        });

      if (participationError) {
        return { data: null, error: participationError };
      }
    }

    return { data, error: null };
  },

  // Obtener detalle de sala
  getRoomDetails: async (roomId) => {
    const { data, error } = await supabase
      .from('sala')
      .select(`
        *,
        materia (
          id,
          nombre
        ),
        participacion (
          id,
          usuario_id,
          rol,
          estado_conexion,
          esta_expulsado,
          fecha_ingreso,
          advertencias
        )
      `)
      .eq('id', roomId)
      .maybeSingle();

    if (error || !data) {
      return { data, error };
    }

    // Obtener nombres de usuarios de las participaciones (dos consultas, sin FK)
    const usuarioIds = (data.participacion || []).map(p => p.usuario_id).filter(Boolean);
    if (usuarioIds.length > 0) {
      const { data: usuarios } = await supabase
        .from('usuario')
        .select('id, nombre_completo')
        .in('id', usuarioIds);

      const usuarioMap = {};
      (usuarios || []).forEach(u => { usuarioMap[u.id] = u.nombre_completo; });

      data.participacion = data.participacion.map(p => ({
        ...p,
        nombre_completo: usuarioMap[p.usuario_id] || null,
      }));
    }

    return { data, error: null };
  },

  // Unirse a una sala
  joinRoom: async (roomId, userId) => {

    // 1. Verificar que la sala existe y está activa
    const { data: room, error: roomError } = await supabase
      .from('sala')
      .select('*')
      .eq('id', roomId)
      .eq('estado', 'activa')
      .maybeSingle();

    if (roomError || !room) {
      return { data: null, error: { message: 'La sala no existe o no está activa' } };
    }

    // 2. Verificar si el usuario tiene un registro (activo o inactivo)
    const { data: existingParticipations, error: checkError } = await supabase
      .from('participacion')
      .select('*')
      .eq('sala_id', roomId)
      .eq('usuario_id', userId)
      .eq('esta_expulsado', false)
      .limit(1);

    const existingParticipation = existingParticipations && existingParticipations.length > 0 ? existingParticipations[0] : null;

    if (existingParticipation) {
      // Si ya está activo, permitir "tomar control" de la sesión (útil después de recarga)
      if (existingParticipation.estado_conexion === 'activo') {
        // Actualizar timestamp para indicar actividad reciente
        const { error: updateError } = await supabase
          .from('participacion')
          .update({ fecha_ingreso: new Date().toISOString() })
          .eq('id', existingParticipation.id);

        if (updateError) {
          return { data: null, error: updateError };
        }

        return { data: room, error: null };
      }

      // Si está inactivo, reactivar
      const { error: reactivateError } = await supabase
        .from('participacion')
        .update({ estado_conexion: 'activo' })
        .eq('id', existingParticipation.id);

      if (reactivateError) {
        return { data: null, error: reactivateError };
      }

      return { data: room, error: null };
    }

    // 3. Verificar capacidad máxima
    const { data: participants, error: countError } = await supabase
      .from('participacion')
      .select('id')
      .eq('sala_id', roomId)
      .eq('estado_conexion', 'activo')
      .eq('esta_expulsado', false);

    const currentParticipants = participants?.length || 0;

    if (currentParticipants >= room.capacidad_maxima) {
      return { data: null, error: { message: 'La sala está llena' } };
    }

    // 4. Crear nueva participación
    const { data, error } = await supabase
      .from('participacion')
      .insert({
        usuario_id: userId,
        sala_id: roomId,
        rol: 'participante',
        estado_conexion: 'activo',
        esta_expulsado: false,
      })
      .select()
      .maybeSingle();

    if (error) {
      return { data: null, error };
    }

    return { data: room, error: null };
  },

  // Unirse a una sala usando código de invitación
  joinRoomByCode: async (codigo, userId) => {
    // 1. Buscar sala por código de invitación
    const { data: room, error: roomError } = await supabase
      .from('sala')
      .select('*')
      .eq('codigo_invitacion', codigo)
      .eq('estado', 'activa')
      .maybeSingle();

    if (roomError || !room) {
      return { data: null, error: { message: 'Código inválido o sala no está activa' } };
    }

    // 2. Verificar si el usuario tiene un registro (activo o inactivo)
    const { data: existingParticipations, error: checkError } = await supabase
      .from('participacion')
      .select('*')
      .eq('sala_id', room.id)
      .eq('usuario_id', userId)
      .eq('esta_expulsado', false)
      .limit(1);

    const existingParticipation = existingParticipations && existingParticipations.length > 0 ? existingParticipations[0] : null;

    if (existingParticipation) {
      // Si ya está activo, permitir "tomar control" de la sesión
      if (existingParticipation.estado_conexion === 'activo') {
        const { error: updateError } = await supabase
          .from('participacion')
          .update({ fecha_ingreso: new Date().toISOString() })
          .eq('id', existingParticipation.id);

        if (updateError) {
          return { data: null, error: updateError };
        }

        return { data: room, error: null };
      }

      // Si está inactivo, reactivar
      const { error: reactivateError } = await supabase
        .from('participacion')
        .update({ estado_conexion: 'activo' })
        .eq('id', existingParticipation.id);

      if (reactivateError) {
        return { data: null, error: reactivateError };
      }

      return { data: room, error: null };
    }

    // 3. Verificar capacidad máxima
    const { data: participants, error: countError } = await supabase
      .from('participacion')
      .select('id')
      .eq('sala_id', room.id)
      .eq('estado_conexion', 'activo')
      .eq('esta_expulsado', false);

    const currentParticipants = participants?.length || 0;

    if (currentParticipants >= room.capacidad_maxima) {
      return { data: null, error: { message: 'La sala está llena' } };
    }

    // 4. Crear nueva participación
    const { data, error } = await supabase
      .from('participacion')
      .insert({
        usuario_id: userId,
        sala_id: room.id,
        rol: 'participante',
        estado_conexion: 'activo',
        esta_expulsado: false,
      })
      .select()
      .maybeSingle();

    if (error) {
      return { data: null, error };
    }

    return { data: room, error: null };
  },

  // Salir de una sala
  leaveRoom: async (roomId, userId) => {
    // 1. Verificar que el usuario está en la sala
    const { data: participations, error: checkError } = await supabase
      .from('participacion')
      .select('*')
      .eq('sala_id', roomId)
      .eq('usuario_id', userId)
      .eq('estado_conexion', 'activo')
      .limit(1);

    const participation = participations && participations.length > 0 ? participations[0] : null;

    if (!participation) {
      return { data: null, error: { message: 'No estás en esta sala' } };
    }

    // 2. Actualizar estado de conexión a inactivo
    const { error } = await supabase
      .from('participacion')
      .update({ estado_conexion: 'inactivo' })
      .eq('id', participation.id);

    if (error) {
      return { data: null, error };
    }

    // 3. Verificar si hay participantes activos restantes
    const { data: activeParticipants, error: countError } = await supabase
      .from('participacion')
      .select('id')
      .eq('sala_id', roomId)
      .eq('estado_conexion', 'activo')
      .eq('esta_expulsado', false);

    const hasActiveParticipants = activeParticipants && activeParticipants.length > 0;

    // 4. Si no hay participantes activos, marcar la sala como inactiva
    if (!hasActiveParticipants) {
      await supabase
        .from('sala')
        .update({ estado: 'inactiva' })
        .eq('id', roomId);
    }

    return { data: { success: true }, error: null };
  },

  // Cerrar sala (solo moderador)
  closeRoom: async (roomId, userId) => {
    // 1. Verificar que el usuario es moderador de la sala
    const { data: participation, error: checkError } = await supabase
      .from('participacion')
      .select('rol')
      .eq('sala_id', roomId)
      .eq('usuario_id', userId)
      .maybeSingle();

    if (!participation || participation.rol !== 'moderador') {
      return { data: null, error: { message: 'Solo el moderador puede cerrar la sala' } };
    }

    // 2. Desconectar a todos los participantes activos
    const { error: disconnectError } = await supabase
      .from('participacion')
      .update({ estado_conexion: 'inactivo' })
      .eq('sala_id', roomId)
      .eq('estado_conexion', 'activo');

    if (disconnectError) {
      return { data: null, error: disconnectError };
    }

    // 3. Cambiar estado de la sala a inactiva
    const { error } = await supabase
      .from('sala')
      .update({ estado: 'inactiva' })
      .eq('id', roomId);

    if (error) {
      return { data: null, error };
    }

    return { data: { success: true }, error: null };
  },

  // Actualizar estado de la sala
  updateRoomStatus: async (roomId, newStatus) => {
    const { error } = await supabase
      .from('sala')
      .update({ estado: newStatus })
      .eq('id', roomId);

    if (error) {
      return { data: null, error };
    }

    return { data: { success: true }, error: null };
  },

  // Obtener participantes de una sala
  getParticipants: async (roomId) => {
    // 1. Obtener participaciones activas de la sala (solo conectados)
    const { data: participaciones, error: participacionesError } = await supabase
      .from('participacion')
      .select('id, usuario_id, rol, estado_conexion, esta_expulsado, fecha_ingreso, advertencias')
      .eq('sala_id', roomId)
      .eq('estado_conexion', 'activo')
      .eq('esta_expulsado', false)
      .order('fecha_ingreso', { ascending: true });

    if (participacionesError) {
      return { data: null, error: participacionesError };
    }

    if (!participaciones || participaciones.length === 0) {
      return { data: [], error: null };
    }

    // 2. Obtener IDs de usuarios
    const usuarioIds = participaciones.map(p => p.usuario_id);

    // 3. Obtener datos de usuarios
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuario')
      .select('id, nombre_completo')
      .in('id', usuarioIds);

    if (usuariosError) {
      return { data: null, error: usuariosError };
    }

    // 4. Unir datos en JavaScript
    const participants = participaciones.map(p => {
      const usuario = usuarios?.find(u => u.id === p.usuario_id);
      return {
        ...p,
        nombre_completo: usuario?.nombre_completo || 'Usuario',
      };
    });

    return { data: participants, error: null };
  },
};
