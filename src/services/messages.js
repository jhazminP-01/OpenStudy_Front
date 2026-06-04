import { supabase } from '../../lib/supabase';
import { INAPPROPRIATE_WORDS } from '../utils/constants';

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
        .maybeSingle();

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
      const { data: messages, error } = await supabase
        .from('mensaje')
        .select('*')
        .eq('sala_id', roomId)
        .eq('censurado', false)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      if (!messages || messages.length === 0) return { data: [], error: null };

      // Obtener nombres de usuarios (sin FK, consulta separada)
      const usuarioIds = [...new Set(messages.map(m => m.usuario_id))];
      const { data: usuarios } = await supabase
        .from('usuario')
        .select('id, nombre_completo')
        .in('id', usuarioIds);

      const usuarioMap = {};
      (usuarios || []).forEach(u => { usuarioMap[u.id] = u.nombre_completo; });

      const data = messages.map(msg => ({
        ...msg,
        usuario: { nombre: usuarioMap[msg.usuario_id] || null },
      }));

      return { data, error: null };
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
        .maybeSingle();

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
      return { valid: false, error: 'El mensaje no puede estar vacío', censored: false, censoredContent: '' };
    }

    if (trimmed.length > 500) {
      return { valid: false, error: 'El mensaje no puede superar los 500 caracteres', censored: false, censoredContent: '' };
    }

    // HU-14: Detectar y censurar palabras inapropiadas
    let censoredContent = trimmed;
    let hasCensored = false;

    INAPPROPRIATE_WORDS.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      if (regex.test(censoredContent)) {
        hasCensored = true;
        censoredContent = censoredContent.replace(regex, '*'.repeat(word.length));
      }
    });

    return {
      valid: true,
      error: null,
      censored: hasCensored,
      censoredContent: hasCensored ? censoredContent : trimmed,
    };
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
