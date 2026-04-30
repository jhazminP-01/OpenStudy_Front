import { supabase } from '../../lib/supabase';

/**
 * Servicio para manejar mensajes de chat en las salas
 * HU-07: Chat en tiempo real
 * Adaptado a BD existente: tabla 'mensaje' con bigint IDs
 */

export const messagesService = {
  /**
   * Enviar un mensaje a una sala
   * @param {number} roomId - ID de la sala (bigint)
   * @param {string} userId - ID del usuario (uuid)
   * @param {string} content - Contenido del mensaje
   * @returns {Promise<{data: object, error: Error}>}
   */
  sendMessage: async (roomId, userId, content) => {
    try {
      const { data, error } = await supabase
        .from('mensaje')
        .insert([
          {
            sala_id: roomId,
            usuario_id: userId,
            contenido: content.trim(),
          },
        ])
        .select('*')
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error sending message:', error);
      return { data: null, error };
    }
  },

  /**
   * Obtener mensajes de una sala (con paginación)
   * @param {number} roomId - ID de la sala (bigint)
   * @param {number} limit - Cantidad de mensajes (default: 50)
   * @param {number} offset - Offset para paginación (default: 0)
   * @returns {Promise<{data: array, error: Error}>}
   */
  getMessages: async (roomId, limit = 50, offset = 0) => {
    try {
      const { data, error } = await supabase
        .from('mensaje')
        .select('*')
        .eq('sala_id', roomId)
        .eq('censurado', false)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error getting messages:', error);
      return { data: [], error };
    }
  },

  /**
   * Editar un mensaje
   * @param {number} messageId - ID del mensaje (bigint)
   * @param {string} userId - ID del usuario (uuid)
   * @param {string} content - Nuevo contenido
   * @returns {Promise<{data: object, error: Error}>}
   */
  editMessage: async (messageId, userId, content) => {
    try {
      const { data, error } = await supabase
        .from('mensaje')
        .update({
          contenido: content.trim(),
        })
        .eq('id', messageId)
        .eq('usuario_id', userId)
        .select('*')
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error editing message:', error);
      return { data: null, error };
    }
  },

  /**
   * Marcar mensaje como censurado (soft delete)
   * @param {number} messageId - ID del mensaje (bigint)
   * @param {string} userId - ID del usuario (uuid)
   * @returns {Promise<{success: boolean, error: Error}>}
   */
  deleteMessage: async (messageId, userId) => {
    try {
      const { error } = await supabase
        .from('mensaje')
        .update({ censurado: true })
        .eq('id', messageId)
        .eq('usuario_id', userId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting message:', error);
      return { success: false, error };
    }
  },

  /**
   * Configurar suscripción realtime para mensajes nuevos
   * @param {number} roomId - ID de la sala (bigint)
   * @param {function} callback - Función a llamar cuando hay cambios
   * @returns {object} Canal de suscripción
   */
  subscribeToMessages: (roomId, callback) => {
    const channel = supabase
      .channel(`mensaje:sala_id=eq.${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mensaje',
          filter: `sala_id=eq.${roomId}`,
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return channel;
  },

  /**
   * Validar contenido de mensaje
   * @param {string} content - Contenido a validar
   * @returns {{valid: boolean, error: string|null}}
   */
  validateMessage: (content) => {
    const trimmed = content?.trim() || '';

    if (trimmed.length === 0) {
      return { valid: false, error: 'El mensaje no puede estar vacío' };
    }

    if (trimmed.length > 500) {
      return { valid: false, error: 'El mensaje no puede superar los 500 caracteres' };
    }

    // Filtro básico de contenido inapropiado (HU-14 placeholder)
    const inappropriateWords = ['spam', 'troll']; // Lista básica
    const hasInappropriate = inappropriateWords.some((word) =>
      trimmed.toLowerCase().includes(word)
    );

    if (hasInappropriate) {
      return { valid: false, error: 'El mensaje contiene contenido inapropiado' };
    }

    return { valid: true, error: null };
  },

  /**
   * Formatear fecha para mostrar en mensajes
   * @param {string} dateString - Fecha ISO
   * @returns {string} Fecha formateada (ej: "14:30" o "Ayer 14:30")
   */
  formatMessageTime: (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${minutes}`;

    if (diffDays === 0) {
      return time;
    } else if (diffDays === 1) {
      return `Ayer ${time}`;
    } else {
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      return `${days[date.getDay()]} ${time}`;
    }
  },

  /**
   * Obtener separador de fecha para agrupar mensajes
   * @param {string} dateString - Fecha ISO
   * @returns {string} Separador (ej: "Hoy", "Ayer", "Lunes")
   */
  getDateSeparator: (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';

    const days = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];
    return days[date.getDay()];
  },
};

export default messagesService;
