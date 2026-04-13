import { supabase } from '../../lib/supabase';

export const authService = {
  // Iniciar sesión
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
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
