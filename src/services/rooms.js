import { supabase } from '../../lib/supabase';

export const roomsService = {
  // Listar salas disponibles
  getRooms: async (filters = {}) => {
    let query = supabase
      .from('rooms')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Crear nueva sala
  createRoom: async (roomData, userId) => {
    const { data, error } = await supabase
      .from('rooms')
      .insert({ ...roomData, moderator_id: userId })
      .select()
      .single();

    return { data, error };
  },

  // Unirse a una sala
  joinRoom: async (roomId, userId) => {
    const { data, error } = await supabase
      .from('room_participants')
      .insert({ room_id: roomId, user_id: userId });

    return { data, error };
  },

  // Salir de una sala
  leaveRoom: async (roomId, userId) => {
    const { error } = await supabase
      .from('room_participants')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', userId);

    return { error };
  },

  // Obtener detalles de una sala
  getRoomDetails: async (roomId) => {
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        participants:room_participants(
          user_id,
          joined_at,
          is_moderator
        )
      `)
      .eq('id', roomId)
      .single();

    return { data, error };
  },

  // Suscribirse a cambios en una sala
  subscribeToRoom: (roomId, callback) => {
    return supabase
      .channel(`room-${roomId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'rooms' },
        callback
      )
      .subscribe();
  },
};
