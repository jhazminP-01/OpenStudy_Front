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
          )
        `)
        .eq('estado', 'activa')
        .order('created_at', { ascending: false });

      if (filters.materia_id) {
        query = query.eq('materia_id', filters.materia_id);
      }

      const { data, error } = await query;

      // Filtrar solo participaciones activas y no expulsadas
      if (data) {
        data.forEach(room => {
          if (room.participacion) {
            room.participacion = room.participacion.filter(
              p => p.estado_conexion === 'activo' && !p.esta_expulsado
            );
          }
        });
      }

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
      .single();

    if (error) {
      return { data: null, error };
    }

    // Verificar si ya existe participación para evitar duplicados (React Strict Mode)
    const { data: existingParticipation } = await supabase
      .from('participacion')
      .select('id')
      .eq('sala_id', data.id)
      .eq('usuario_id', userId)
      .single();

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
          fecha_ingreso
        )
      `)
      .eq('id', roomId)
      .single();

    return { data, error };
  },

  // Unirse a una sala
  joinRoom: async (roomId, userId) => {

    // 1. Verificar que la sala existe y está activa
    const { data: room, error: roomError } = await supabase
      .from('sala')
      .select('*')
      .eq('id', roomId)
      .eq('estado', 'activa')
      .single();

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
      // Si ya está activo, error
      if (existingParticipation.estado_conexion === 'activo') {
        return { data: null, error: { message: 'Ya estás en esta sala' } };
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
      .single();

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

    return { data: { success: true }, error: null };
  },
};