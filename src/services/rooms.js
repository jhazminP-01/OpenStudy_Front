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
            esta_expulsado
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
};