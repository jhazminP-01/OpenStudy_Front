export const validateCreateRoom = ({
  nombre,
  materia_id,
  capacidad_maxima,
}) => {
  const errors = {};

  const trimmedName = nombre?.trim() || '';

  if (!trimmedName) {
    errors.nombre = 'El nombre de la sala es obligatorio';
  } else if (trimmedName.length < 3) {
    errors.nombre = 'El nombre debe tener al menos 3 caracteres';
  } else if (trimmedName.length > 50) {
    errors.nombre = 'El nombre no puede superar los 50 caracteres';
  }

  if (!materia_id) {
    errors.materia_id = 'Debes seleccionar una materia';
  }

  if (!capacidad_maxima && capacidad_maxima !== 0) {
    errors.capacidad_maxima = 'Debes indicar la capacidad máxima';
  } else if (
    Number(capacidad_maxima) < 2 ||
    Number(capacidad_maxima) > 50
  ) {
    errors.capacidad_maxima = 'La capacidad debe estar entre 2 y 50';
  }

  return errors;
};