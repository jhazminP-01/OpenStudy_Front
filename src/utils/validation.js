// Utilidades de validación para formularios

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // Mínimo 6 caracteres, al menos una letra y un número
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
  return passwordRegex.test(password);
};

export const validateUsername = (username) => {
  // Mínimo 3 caracteres, máximo 20, solo letras y números
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export const validateRoomName = (name) => {
  // Mínimo 3 caracteres, máximo 50
  return name && name.trim().length >= 3 && name.trim().length <= 50;
};

export const validateMessage = (message) => {
  // Máximo 500 caracteres, no vacío
  return message && message.trim().length > 0 && message.trim().length <= 500;
};

// Validación completa para formulario de registro
export const validateRegisterForm = (formData) => {
  const errors = {};

  if (!formData.username || !formData.username.trim()) {
    errors.username = 'El nombre de usuario es requerido';
  } else if (!validateUsername(formData.username)) {
    errors.username = 'El nombre de usuario debe tener entre 3 y 20 caracteres';
  }

  if (!formData.email || !formData.email.trim()) {
    errors.email = 'El correo electrónico es requerido';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'El correo electrónico no es válido';
  }

  if (!formData.password) {
    errors.password = 'La contraseña es requerida';
  } else if (!validatePassword(formData.password)) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres, una letra y un número';
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Confirma tu contraseña';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validación para formulario de login
export const validateLoginForm = (formData) => {
  const errors = {};

  if (!formData.email || !formData.email.trim()) {
    errors.email = 'El correo electrónico es requerido';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'El correo electrónico no es válido';
  }

  if (!formData.password) {
    errors.password = 'La contraseña es requerida';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validación para creación de sala
export const validateRoomForm = (formData) => {
  const errors = {};

  if (!formData.name || !formData.name.trim()) {
    errors.name = 'El nombre de la sala es requerido';
  } else if (!validateRoomName(formData.name)) {
    errors.name = 'El nombre debe tener entre 3 y 50 caracteres';
  }

  if (formData.description && formData.description.length > 200) {
    errors.description = 'La descripción no puede exceder 200 caracteres';
  }

  if (!formData.category) {
    errors.category = 'Debes seleccionar una categoría';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  validateEmail,
  validatePassword,
  validateUsername,
  validateRoomName,
  validateMessage,
  validateRegisterForm,
  validateLoginForm,
  validateRoomForm,
};
