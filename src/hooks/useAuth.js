import { useState, useEffect } from 'react';
import { authService } from '../services/auth';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuchar cambios de autenticación (ya maneja sesión inicial)
    const { data: authListener } = authService.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    const { data, error } = await authService.login(email, password);
    if (!error) {
      setUser(data.user);
    }
    setLoading(false);
    return { data, error };
  };

  const register = async (email, password, metadata) => {
    setLoading(true);
    const { data, error } = await authService.register(email, password, metadata);
    setLoading(false);
    return { data, error };
  };

  const logout = async () => {
    setLoading(true);
    const { error } = await authService.logout();
    if (!error) {
      setUser(null);
    }
    setLoading(false);
    return { error };
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
  };
};
