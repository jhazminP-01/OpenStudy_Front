// Validaciones de formularios

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

export const validateRoomName = (name) => {
  return name && name.trim().length >= 3 && name.trim().length <= 50;
};

export const validateMessage = (message) => {
  return message && message.trim().length > 0 && message.trim().length <= 500;
};
