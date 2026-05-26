import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles';
import { reportsService } from '../../services/reports';
import InAppNotification from '../ui/InAppNotification';
import ConfirmModal from '../ui/ConfirmModal';

const ModerationPanel = ({ visible, onClose, salaId }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState({ visible: false, variant: 'success', title: '', message: '' });
  const [confirmExpel, setConfirmExpel] = useState({ visible: false, report: null });
  const channelRef = useRef(null);

  const loadReports = useCallback(async () => {
    if (!salaId) return;
    try {
      setLoading(true);
      const { data, error } = await reportsService.getReports(salaId);
      if (error) {
        console.error('Error loading reports:', error);
      } else {
        setReports(data || []);
      }
    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  }, [salaId]);

  useEffect(() => {
    if (visible && salaId) {
      loadReports();

      channelRef.current = reportsService.subscribeToReports(salaId, (payload) => {
        if (payload.new) {
          setReports((prev) => [payload.new, ...prev]);
        }
      }, 'panel');
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [visible, salaId, loadReports]);

  const removeReport = (reportId) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
  };

  const showToast = (variant, title, message) => {
    setToast({ visible: true, variant, title, message });
  };

  const handleWarn = async (report) => {
    setActionLoading(report.id);
    const { error, autoExpulsado } = await reportsService.warnUser(
      salaId,
      report.reportado_id,
      report.id
    );
    setActionLoading(null);

    if (error) {
      showToast('error', 'Error', 'No se pudo advertir al usuario.');
      return;
    }

    if (autoExpulsado) {
      showToast('error', 'Expulsión automática', 'Usuario expulsado por acumular 3 advertencias.');
    } else {
      showToast('success', 'Advertencia enviada', 'Se registró una advertencia al usuario.');
    }

    removeReport(report.id);
  };

  const handleDeleteMessage = async (report) => {
    if (!report.mensaje_id) return;
    setActionLoading(report.id);
    const { error } = await reportsService.deleteMessage(report.mensaje_id, report.id);
    setActionLoading(null);

    if (error) {
      showToast('error', 'Error', 'No se pudo eliminar el mensaje.');
      return;
    }

    showToast('success', 'Mensaje eliminado', 'El mensaje fue eliminado correctamente.');
    removeReport(report.id);
  };

  const handleExpel = (report) => {
    setConfirmExpel({ visible: true, report });
  };

  const confirmExpelUser = async () => {
    const report = confirmExpel.report;
    setConfirmExpel({ visible: false, report: null });
    if (!report) return;

    setActionLoading(report.id);
    const { error } = await reportsService.expelUser(
      salaId,
      report.reportado_id,
      report.id
    );
    setActionLoading(null);

    if (error) {
      showToast('error', 'Error', 'No se pudo expulsar al usuario.');
      return;
    }

    showToast('success', 'Usuario expulsado', 'El usuario fue expulsado de la sala.');
    removeReport(report.id);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderReport = (report) => {
    const isMessage = report.tipo === 'mensaje';
    const isLoading = actionLoading === report.id;

    return (
      <View key={report.id} style={styles.reportCard}>
        {/* Header del reporte */}
        <View style={styles.reportHeader}>
          <View style={[styles.typeBadge, isMessage ? styles.typeBadgeMessage : styles.typeBadgeUser]}>
            <Ionicons
              name={isMessage ? 'chatbubble-outline' : 'person-outline'}
              size={14}
              color={isMessage ? COLORS.warning : COLORS.error}
            />
            <Text style={[styles.typeBadgeText, isMessage ? styles.typeBadgeTextMessage : styles.typeBadgeTextUser]}>
              {isMessage ? 'Mensaje' : 'Usuario'}
            </Text>
          </View>
          <Text style={styles.reportDate}>{formatDate(report.created_at)}</Text>
        </View>

        {/* Motivo */}
        <Text style={styles.reportMotivo}>{report.motivo}</Text>

        {/* Descripción */}
        {report.descripcion && (
          <Text style={styles.reportDescripcion}>{report.descripcion}</Text>
        )}

        {/* Reportado por */}
        {report.reportante?.nombre_completo && (
          <View style={styles.reportedInfo}>
            <Ionicons name="flag-outline" size={14} color={COLORS.textRoomsTertiary} />
            <Text style={styles.reportedName}>
              Reportado por: {report.reportante.nombre_completo}
            </Text>
          </View>
        )}

        {/* Usuario/Autor reportado */}
        {report.reportado?.nombre_completo && (
          <View style={styles.reportedInfo}>
            <Ionicons name="person-circle-outline" size={16} color={COLORS.textRoomsTertiary} />
            <Text style={styles.reportedName}>
              {isMessage ? 'Autor del mensaje' : 'Usuario reportado'}: {report.reportado.nombre_completo}
            </Text>
          </View>
        )}

        {/* Contenido del mensaje si es tipo mensaje */}
        {isMessage && report.contenido_mensaje && (
          <View style={styles.messagePreview}>
            <Ionicons name="chatbubble-outline" size={13} color={COLORS.textRoomsTertiary} />
            <Text style={styles.messagePreviewText} numberOfLines={3}>
              "{report.contenido_mensaje}"
            </Text>
          </View>
        )}

        {/* Indicador de automático */}
        {report.es_automatico && (
          <View style={styles.autoBadge}>
            <Ionicons name="flash" size={12} color={COLORS.warning} />
            <Text style={styles.autoBadgeText}>Detectado automáticamente</Text>
          </View>
        )}

        {/* Acciones */}
        {isLoading ? (
          <View style={styles.actionsRow}>
            <ActivityIndicator color={COLORS.primary} size="small" />
          </View>
        ) : (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionWarn]}
              onPress={() => handleWarn(report)}
            >
              <Ionicons name="warning-outline" size={16} color={COLORS.warning} />
              <Text style={styles.actionWarnText}>Advertir</Text>
            </TouchableOpacity>

            {isMessage && report.mensaje_id && (
              <TouchableOpacity
                style={[styles.actionButton, styles.actionDelete]}
                onPress={() => handleDeleteMessage(report)}
              >
                <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                <Text style={styles.actionDeleteText}>Eliminar</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, styles.actionExpel]}
              onPress={() => handleExpel(report)}
            >
              <Ionicons name="ban-outline" size={16} color="#FF6B6B" />
              <Text style={styles.actionExpelText}>Expulsar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
              <Text style={styles.title}>Panel de moderación</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={22} color={COLORS.textRoomsTertiary} />
            </TouchableOpacity>
          </View>

          {/* Contenido */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.centerState}>
                <ActivityIndicator color={COLORS.primary} size="large" />
                <Text style={styles.stateText}>Cargando reportes...</Text>
              </View>
            ) : reports.length === 0 ? (
              <View style={styles.centerState}>
                <Ionicons name="checkmark-circle-outline" size={56} color={COLORS.success} />
                <Text style={styles.stateText}>No hay reportes pendientes</Text>
                <Text style={styles.stateSubText}>La sala está en orden.</Text>
              </View>
            ) : (
              reports.map(renderReport)
            )}
          </ScrollView>
        </View>

        <InAppNotification
          visible={toast.visible}
          variant={toast.variant}
          title={toast.title}
          message={toast.message}
          duration={4000}
          onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
        />
      </View>

      <ConfirmModal
        visible={confirmExpel.visible}
        title="Expulsar usuario"
        message="¿Estás seguro de expulsar a este usuario? No podrá reingresar a la sala."
        confirmText="Expulsar"
        cancelText="Cancelar"
        onConfirm={confirmExpelUser}
        onCancel={() => setConfirmExpel({ visible: false, report: null })}
        icon="ban-outline"
        iconColor={COLORS.error}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  container: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderRoomsLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  centerState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: 10,
  },
  stateText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textWhite,
  },
  stateSubText: {
    fontSize: 13,
    color: COLORS.textRoomsTertiary,
  },
  reportCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeUser: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  typeBadgeMessage: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  typeBadgeTextUser: {
    color: COLORS.error,
  },
  typeBadgeTextMessage: {
    color: COLORS.warning,
  },
  reportDate: {
    fontSize: 11,
    color: COLORS.textRoomsTertiary,
  },
  reportMotivo: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textWhite,
    marginBottom: 4,
  },
  reportDescripcion: {
    fontSize: 13,
    color: COLORS.textRoomsMuted,
    marginBottom: 8,
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
    marginBottom: 8,
  },
  messagePreviewText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textRoomsMuted,
    fontStyle: 'italic',
  },
  reportedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  reportedName: {
    fontSize: 13,
    color: COLORS.textRoomsSecondary,
    fontWeight: '500',
  },
  autoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  autoBadgeText: {
    fontSize: 11,
    color: COLORS.warning,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionWarn: {
    borderColor: 'rgba(245, 158, 11, 0.3)',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  actionWarnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.warning,
  },
  actionDelete: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  actionDeleteText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.error,
  },
  actionExpel: {
    borderColor: 'rgba(255, 107, 107, 0.3)',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  actionExpelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B6B',
  },
});

export default ModerationPanel;
