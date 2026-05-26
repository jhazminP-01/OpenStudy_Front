// Constantes globales

export const TIMER_DEFAULTS = {
  WORK_MINUTES: 25,
  BREAK_MINUTES: 5,
  LONG_BREAK_MINUTES: 30,
  CYCLES_BEFORE_LONG_BREAK: 4,
};

export const ROOM_CATEGORIES = [
  'Matemáticas',
  'Programación',
  'Ciencias',
  'Literatura',
  'Historia',
  'Idiomas',
  'Arte',
  'Música',
  'Otros',
];

export const MAX_PARTICIPANTS_PER_ROOM = 10;

export const REPORT_REASONS = [
  'Spam',
  'Contenido inapropiado',
  'Acoso',
  'Lenguaje ofensivo',
  'Falta de respeto',
  'Otro',
];

export const TIMER_STATUSES = {
  STOPPED: 'stopped',
  RUNNING: 'running',
  PAUSED: 'paused',
  BREAK: 'break',
};

export const ROOM_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
};

export const INAPPROPRIATE_WORDS = [
  // Groserías comunes en español
  'puta', 'puto', 'mierda', 'culo', 'coño', 'pendejo', 'pendeja',
  'idiota', 'imbecil', 'estupido', 'estupida', 'cabron', 'cabrona',
  'hdp', 'ctm', 'concha', 'verga', 'chinga', 'chingada', 'joder',
  'gilipollas', 'subnormal', 'maricón', 'maricon', 'perra', 'zorra',
  'bastardo', 'bastarda', 'malparido', 'gonorrea', 'hijueputa',
  // Acoso / discriminación
  'negro', 'negra', 'indio', 'india', 'gordo', 'gorda', 'feo', 'fea',
  'retrasado', 'mongolico', 'tarado',
];

export const NOTIFICATION_TYPES = {
  TIMER_FINISHED: 'timer_finished',
  BREAK_FINISHED: 'break_finished',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  NEW_MESSAGE: 'new_message',
  ROOM_CREATED: 'room_created',
};
