import { supabase } from '../../lib/supabase';
import { bansService } from './bans';

export const authService = {
  // Iniciar sesión
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Traducir errores de Supabase al español
      let errorMessage = error.message;
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Correo o contraseña incorrectos';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Por favor confirma tu correo electrónico';
      } else if (error.message.includes('User not found')) {
        errorMessage = 'Usuario no encontrado';
      }
      return { data, error: { ...error, message: errorMessage } };
    }

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
