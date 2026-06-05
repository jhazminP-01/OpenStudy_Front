import { useState, useEffect } from 'react';
import { roomsService } from '../services/rooms';

export const useRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar todas las salas
  const loadRooms = async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await roomsService.getRooms(filters);
      if (error) throw error;
      setRooms(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva sala
  const createRoom = async (roomData, userId) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await roomsService.createRoom(roomData, userId);
      if (error) throw error;
      
      // Recargar la lista de salas
      await loadRooms();
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Unirse a una sala
  const joinRoom = async (roomId, userId) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await roomsService.joinRoom(roomId, userId);
      if (error) throw error;
      return { success: true, error: null };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Salir de una sala
  const leaveRoom = async (roomId, userId) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await roomsService.leaveRoom(roomId, userId);
      if (error) throw error;
      // Recargar salas para reflejar cambios de estado
      await loadRooms();
      return { success: true, error: null };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sala (solo moderador)
  const closeRoom = async (roomId, userId) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await roomsService.closeRoom(roomId, userId);
      if (error) throw error;
      // Recargar salas para reflejar cambios de estado
      await loadRooms();
      return { success: true, error: null };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Cargar salas al montar el hook
  useEffect(() => {
    loadRooms();
  }, []);

  return {
    rooms,
    loading,
    error,
    loadRooms,
    createRoom,
    joinRoom,
    leaveRoom,
    closeRoom,
  };
};
