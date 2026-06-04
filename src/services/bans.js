import { supabase } from '../../lib/supabase';

export const bansService = {
  // Verificar si un usuario tiene un baneo activo
  checkUserBan: async (userId) => {
    // Obtener todos los baneos del usuario, ordenados por fecha
    const { data: bans, error } = await supabase
      .from('baneo_usuario')
      .select('*')
      .eq('usuario_id', userId)
      .order('fecha_expulsion', { ascending: false });

    if (error) {
      return { data: null, error };
    }
    
    if (!bans || bans.length === 0) {
      return { data: null, error: null, isBanned: false };
    }

    const now = new Date();
    
    // Buscar un baneo activo
    const activeBan = bans.find(ban => {
      // Si es permanente, está activo
      if (ban.es_permanente) return true;
      
      // Si tiene fecha de fin, verificar si aún no ha pasado
      if (ban.fecha_fin_baneo) {
        const endDate = new Date(ban.fecha_fin_baneo);
        return endDate > now;
      }
      
      return false;
    });
    
    if (!activeBan) {
      return { data: null, error: null, isBanned: false };
    }

    const data = activeBan;

    // Calcular tiempo restante
    let tiempoRestante = null;
    if (data.es_permanente) {
      tiempoRestante = 'permanente';
    } else if (data.fecha_fin_baneo) {
      const fin = new Date(data.fecha_fin_baneo);
      const ahora = new Date();
      const diffMs = fin - ahora;
      const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHoras = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (diffDias > 0) {
        tiempoRestante = `${diffDias} día${diffDias > 1 ? 's' : ''} y ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
      } else if (diffHoras > 0) {
        tiempoRestante = `${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
      } else {
        tiempoRestante = 'menos de 1 hora';
      }
    }

    return { 
      data: { ...data, tiempoRestante }, 
      error: null, 
      isBanned: true 
    };
  },

  // Crear un nuevo baneo (automático al expulsar de sala)
  createBan: async (userId, salaId, motivo = 'Conductas inapropiadas') => {
    // 1. Obtener número de expulsiones previas
    const { data: prevBans, error: countError } = await supabase
      .from('baneo_usuario')
      .select('numero_expulsion')
      .eq('usuario_id', userId)
      .order('fecha_expulsion', { ascending: false });

    if (countError) return { data: null, error: countError };

    const numeroExpulsion = (prevBans?.length || 0) + 1;
    
    // 2. Calcular duración según número de expulsión
    let fechaFinBaneo = null;
    let esPermanente = false;
    const fechaExpulsion = new Date();

    if (numeroExpulsion === 1) {
      // 1 día
      fechaFinBaneo = new Date(fechaExpulsion.getTime() + (24 * 60 * 60 * 1000));
    } else if (numeroExpulsion === 2) {
      // 1 semana (7 días)
      fechaFinBaneo = new Date(fechaExpulsion.getTime() + (7 * 24 * 60 * 60 * 1000));
    } else if (numeroExpulsion >= 3) {
      // Permanente
      esPermanente = true;
      fechaFinBaneo = null;
    }

    // 3. Crear registro de baneo
    const { data, error } = await supabase
      .from('baneo_usuario')
      .insert({
        usuario_id: userId,
        numero_expulsion: numeroExpulsion,
        fecha_expulsion: fechaExpulsion.toISOString(),
        fecha_fin_baneo: fechaFinBaneo ? fechaFinBaneo.toISOString() : null,
        es_permanente: esPermanente,
        motivo: motivo,
        sala_id: salaId,
      })
      .select()
      .maybeSingle();

    return { data, error };
  },

  // Obtener historial de baneos de un usuario
  getBanHistory: async (userId) => {
    const { data, error } = await supabase
      .from('baneo_usuario')
      .select(`
        *,
        sala (
          id,
          nombre
        )
      `)
      .eq('usuario_id', userId)
      .order('fecha_expulsion', { ascending: false });

    return { data, error };
  },
};
