// Configuración base para la API
const API_BASE_URL = 'http://localhost:3000/api';

// Configuración de headers por defecto
const defaultHeaders = {
  'Content-Type': 'application/json',
};

// Función para realizar peticiones a la API
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: defaultHeaders,
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    console.error('Error en la petición a la API:', error);
    throw new Error('No se pudo conectar al servidor');
  }
};

// Métodos específicos para la API
export const api = {
  // Autenticación
  register: (userData) => 
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    
  login: (credentials) => 
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    
  // Salas
  getRooms: () => 
    apiRequest('/rooms'),
    
  createRoom: (roomData) => 
    apiRequest('/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData),
    }),
    
  joinRoom: (roomId) => 
    apiRequest(`/rooms/${roomId}/join`, {
      method: 'POST',
    }),
    
  leaveRoom: (roomId) => 
    apiRequest(`/rooms/${roomId}/leave`, {
      method: 'POST',
    }),
    
  // Chat
  getMessages: (roomId) => 
    apiRequest(`/rooms/${roomId}/messages`),
    
  sendMessage: (roomId, message) => 
    apiRequest(`/rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify(message),
    }),
    
  // Pomodoro
  startPomodoro: (roomId, settings) => 
    apiRequest(`/rooms/${roomId}/pomodoro/start`, {
      method: 'POST',
      body: JSON.stringify(settings),
    }),
    
  pausePomodoro: (roomId) => 
    apiRequest(`/rooms/${roomId}/pomodoro/pause`, {
      method: 'POST',
    }),
    
  resetPomodoro: (roomId) => 
    apiRequest(`/rooms/${roomId}/pomodoro/reset`, {
      method: 'POST',
    }),
    
  // Reportes
  reportUser: (roomId, reportData) => 
    apiRequest(`/rooms/${roomId}/reports`, {
      method: 'POST',
      body: JSON.stringify(reportData),
    }),
    
  // Perfil
  getProfile: () => 
    apiRequest('/profile'),
    
  updateProfile: (profileData) => 
    apiRequest('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
    
  getStats: () => 
    apiRequest('/profile/stats'),
};

export default api;
