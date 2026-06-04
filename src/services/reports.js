import { supabase } from '../../lib/supabase';

export const reportsService = {
  // 1. Crear reporte
  createReport: async (salaId, reportanteId, data) => {
    const { data: result, error } = await supabase
      .from('reporte')
      .insert({
        sala_id: salaId,
        reportante_id: reportanteId,
        reportado_id: data.reportadoId || null,
        mensaje_id: data.mensajeId || null,
        motivo: data.motivo,
        descripcion: data.descripcion || null,
        tipo: data.tipo,
        estado: 'pendiente',
        es_automatico: false,
      })
      .select()
      .maybeSingle();

    return { data: result, error };
  },

  // 2. Obtener reportes pendientes de una sala
  getReports: async (salaId) => {
    const { data, error } = await supabase
      .from('reporte')
      .select(`
        *,
        reportante:usuario!reportante_id(id, nombre_completo),
        reportado:usuario!reportado_id(id, nombre_completo)
      `)
      .eq('sala_id', salaId)
      .eq('estado', 'pendiente')
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // 3. Actualizar estado de un reporte
  updateReportStatus: async (reportId, estado, accionTomada) => {
    const update = { estado };
    if (accionTomada) update.accion_tomada = accionTomada;

    const { data, error } = await supabase
      .from('reporte')
      .update(update)
      .eq('id', reportId)
      .select()
      .maybeSingle();

    return { data, error };
  },

  // 4. Advertir usuario (incrementa advertencias, expulsa si >= 3)
  warnUser: async (salaId, reportadoId, reportId) => {
    // Buscar participación actual (activa, no expulsada)
    const { data: participacion, error: fetchError } = await supabase
      .from('participacion')
      .select('id, advertencias')
      .eq('sala_id', salaId)
      .eq('usuario_id', reportadoId)
      .eq('esta_expulsado', false)
      .maybeSingle();

    if (fetchError) return { data: null, error: fetchError, autoExpulsado: false };
    if (!participacion) return { data: null, error: { message: 'Usuario no encontrado en la sala' }, autoExpulsado: false };

    const nuevasAdvertencias = (participacion.advertencias || 0) + 1;
    const autoExpulsado = nuevasAdvertencias >= 3;

    // Actualizar participación
    const updateData = { advertencias: nuevasAdvertencias };
    if (autoExpulsado) {
      updateData.esta_expulsado = true;
      updateData.estado_conexion = 'inactivo';
    }

    const { error: updateError } = await supabase
      .from('participacion')
      .update(updateData)
      .eq('id', participacion.id);

    if (updateError) return { data: null, error: updateError, autoExpulsado: false };

    // Actualizar reporte
    const accion = autoExpulsado ? 'expulsion_automatica' : 'advertencia';
    const { data, error } = await supabase
      .from('reporte')
      .update({ estado: 'revisado', accion_tomada: accion })
      .eq('id', reportId)
      .select()
      .maybeSingle();

    return { data, error, autoExpulsado };
  },

  // 5. Eliminar mensaje
  deleteMessage: async (mensajeId, reportId) => {
    const { error: deleteError } = await supabase
      .from('mensaje')
      .delete()
      .eq('id', mensajeId);

    if (deleteError) return { data: null, error: deleteError };

    const { data, error } = await supabase
      .from('reporte')
      .update({ estado: 'revisado', accion_tomada: 'mensaje_eliminado' })
      .eq('id', reportId)
      .select()
      .maybeSingle();

    return { data, error };
  },

  // 6. Expulsar usuario
  expelUser: async (salaId, reportadoId, reportId) => {
    const { error: expelError } = await supabase
      .from('participacion')
      .update({ esta_expulsado: true, estado_conexion: 'inactivo' })
      .eq('sala_id', salaId)
      .eq('usuario_id', reportadoId);

    if (expelError) return { data: null, error: expelError };

    const { data, error } = await supabase
      .from('reporte')
      .update({ estado: 'revisado', accion_tomada: 'expulsion' })
      .eq('id', reportId)
      .select()
      .maybeSingle();

    return { data, error };
  },

  // 7. Suscripción Realtime para nuevos reportes
  subscribeToReports: (salaId, callback, suffix = '') => {
    const channelName = `reportes-sala-${salaId}${suffix ? `-${suffix}` : `-${Date.now()}`}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reporte',
          filter: `sala_id=eq.${salaId}`,
        },
        (payload) => callback(payload)
      )
      .subscribe();

    return channel;
  },
};
