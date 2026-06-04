import { supabase } from '../../lib/supabase';
import { bansService } from './bans';

export const authService = {
  // Iniciar sesión
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { data, error };

    // Verificar si el usuario está baneado
    const { isBanned, data: banData } = await bansService.checkUserBan(data.user.id);

    if (isBanned) {
      return { 
        data: null, 
        error: { 
          message: 'USER_BANNED',
          banData: banData
        } 
      };
    }

    return { data, error: null };
  },

  // Registrar usuario
  register: async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    return { data, error };
  },

  // Cerrar sesión
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Obtener usuario actual
  getCurrentUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    return { data, error };
  },

  // Escuchar cambios de autenticación
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};
