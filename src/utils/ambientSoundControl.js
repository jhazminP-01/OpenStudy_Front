// Módulo de eventos para controlar el sonido ambiental desde cualquier pantalla
let paused = false;
const listeners = new Set();

export const ambientSoundControl = {
  pause: () => {
    paused = true;
    listeners.forEach(fn => fn('pause'));
  },
  resume: () => {
    paused = false;
    listeners.forEach(fn => fn('resume'));
  },
  isPaused: () => paused,
  subscribe: (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
