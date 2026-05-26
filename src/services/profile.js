import { supabase } from '../../lib/supabase';

const DEFAULT_CONFIG = {
  notificaciones: true,
  modo_oscuro: false,
  sonidos_timer: true,
  sonido_enfoque: 'campana',
  sonido_descanso: 'chime',
};

export const profileService = {
  getProfile: async (userId) => {
    try {
      const [{ data: userData }, { data: authData }] = await Promise.all([
        supabase.from('usuario').select('nombre_completo').eq('id', userId).maybeSingle(),
        supabase.auth.getUser(),
      ]);
      return {
        data: {
          nombre_completo: userData?.nombre_completo || '',
          email: authData?.user?.email || '',
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  getStats: async (userId) => {
    try {
      const [sesionesRes, salasRes] = await Promise.all([
        supabase
          .from('sesion_pomodoro')
          .select('duracion')
          .eq('usuario_id', userId)
          .eq('completada', true),
        supabase
          .from('participacion')
          .select('sala_id')
          .eq('usuario_id', userId),
      ]);

      const sesiones = sesionesRes.data?.length || 0;
      const totalMinutos = sesionesRes.data?.reduce((acc, s) => acc + (s.duracion || 0), 0) || 0;
      const horas = Math.round((totalMinutos / 60) * 10) / 10;

      const salasUnicas = new Set(salasRes.data?.map((p) => p.sala_id) || []);
      const salas = salasUnicas.size;

      return { data: { sesiones, horas, salas }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getConfig: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('configuracion_usuario')
        .select('*')
        .eq('usuario_id', userId)
        .maybeSingle();

      if (error) return { data: DEFAULT_CONFIG, error: null };

      if (!data) {
        const { data: inserted, error: insertError } = await supabase
          .from('configuracion_usuario')
          .insert({ usuario_id: userId, ...DEFAULT_CONFIG })
          .select()
          .single();
        return { data: inserted || DEFAULT_CONFIG, error: insertError };
      }

      return { data, error: null };
    } catch (error) {
      return { data: DEFAULT_CONFIG, error };
    }
  },

  updateConfig: async (userId, config) => {
    try {
      // Obtener config actual para mergear con los cambios
      const { data: existing } = await supabase
        .from('configuracion_usuario')
        .select('*')
        .eq('usuario_id', userId)
        .maybeSingle();

      // Remove 'id' from existing config to avoid conflict with GENERATED ALWAYS
      const { id, ...existingWithoutId } = existing || {};
      const mergedConfig = {
        ...(existingWithoutId || DEFAULT_CONFIG),
        ...config,
        usuario_id: userId,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('configuracion_usuario')
        .upsert(mergedConfig, { onConflict: 'usuario_id' })
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  getWeeklyStats: async (userId) => {
    try {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMonday);
      monday.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('sesion_pomodoro')
        .select('*')
        .eq('usuario_id', userId)
        .gte('created_at', monday.toISOString());

      if (error) throw error;

      const completed = data?.filter((s) => s.completada) || [];
      const total = data?.length || 0;
      const completedCount = completed.length;

      const duracionTotal = completed.reduce((acc, s) => acc + (s.duracion || 0), 0);
      const horas_semana = Math.round((duracionTotal / 60) * 10) / 10;

      const eficiencia = total > 0 ? Math.round((completedCount / total) * 100) : 0;

      const diasConSesion = new Set(
        completed.map((s) => new Date(s.created_at).toDateString())
      );
      let dias_seguidos = 0;
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(now);
        checkDate.setDate(now.getDate() - i);
        if (diasConSesion.has(checkDate.toDateString())) {
          dias_seguidos++;
        } else if (i > 0) {
          break;
        }
      }

      return {
        data: { dias_seguidos, horas_semana, pomodoros: completedCount, eficiencia },
        error: null,
      };
    } catch (error) {
      return { data: { dias_seguidos: 0, horas_semana: 0, pomodoros: 0, eficiencia: 0 }, error };
    }
  },

  getWeeklyChartData: async (userId) => {
    try {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMonday);
      monday.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('sesion_pomodoro')
        .select('duracion, created_at, completada')
        .eq('usuario_id', userId)
        .eq('completada', true)
        .gte('created_at', monday.toISOString());

      if (error) throw error;

      const dias = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
      const horasPorDia = [0, 0, 0, 0, 0, 0, 0];

      data?.forEach((s) => {
        const date = new Date(s.created_at);
        const dayIndex = (date.getDay() + 6) % 7;
        horasPorDia[dayIndex] += (s.duracion || 0) / 60;
      });

      return {
        data: dias.map((dia, i) => ({ dia, horas: Math.round(horasPorDia[i] * 10) / 10 })),
        error: null,
      };
    } catch (error) {
      return { data: [{ dia: 'L', horas: 0 }, { dia: 'M', horas: 0 }, { dia: 'X', horas: 0 }, { dia: 'J', horas: 0 }, { dia: 'V', horas: 0 }, { dia: 'S', horas: 0 }, { dia: 'D', horas: 0 }], error };
    }
  },

  getRecentActivity: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('sesion_pomodoro')
        .select('duracion, created_at, sala_id, sala(nombre)')
        .eq('usuario_id', userId)
        .eq('completada', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const isToday = date.toDateString() === now.toDateString();
        const isYesterday = date.toDateString() === yesterday.toDateString();

        if (isToday) return 'Hoy';
        if (isYesterday) return 'Ayer';
        return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
      };

      const formatDuration = (min) => {
        const h = Math.floor(min / 60);
        const m = min % 60;
        if (h > 0 && m > 0) return `${h}h ${m}m`;
        if (h > 0) return `${h}h`;
        return `${m}m`;
      };

      const activity = data?.map((s) => ({
        sala_nombre: s.sala?.nombre || 'Sala sin nombre',
        fecha_formateada: formatDate(s.created_at),
        duracion_formateada: formatDuration(s.duracion || 0),
      })) || [];

      return { data: activity, error: null };
    } catch (error) {
      return { data: [], error };
    }
  },
};

export default profileService;
