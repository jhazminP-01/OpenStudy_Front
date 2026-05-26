import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles';
import { REPORT_REASONS } from '../../utils/constants';
import { reportsService } from '../../services/reports';
import { useAuth } from '../../hooks/useAuth';

const ReportMessageModal = ({ visible, onClose, message, salaId }) => {
  const { user } = useAuth();
  const [selectedReason, setSelectedReason] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const resetState = () => {
    setSelectedReason(null);
    setDescription('');
    setLoading(false);
    setSuccess(false);
    setError('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      setError('Selecciona un motivo para el reporte.');
      return;
    }

    setLoading(true);
    setError('');

    const { error: submitError } = await reportsService.createReport(salaId, user.id, {
      tipo: 'mensaje',
      reportadoId: message.usuario_id,
      mensajeId: message.id,
      motivo: selectedReason,
      descripcion: description.trim() || null,
    });

    setLoading(false);

    if (submitError) {
      setError('No se pudo enviar el reporte. Intenta de nuevo.');
      return;
    }

    setSuccess(true);
    setTimeout(handleClose, 1800);
  };

  const truncatedContent = message?.contenido?.length > 120
    ? message.contenido.substring(0, 120) + '...'
    : message?.contenido;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Reportar mensaje</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={22} color={COLORS.textRoomsTertiary} />
            </TouchableOpacity>
          </View>

          {success ? (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={56} color={COLORS.success} />
              <Text style={styles.successText}>Reporte enviado</Text>
              <Text style={styles.successSub}>El moderador revisará este mensaje.</Text>
            </View>
          ) : (
            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
              {/* Mensaje reportado */}
              <View style={styles.messagePreview}>
                <Ionicons name="chatbubble-outline" size={16} color={COLORS.textRoomsTertiary} />
                <Text style={styles.messageText} numberOfLines={4}>
                  "{truncatedContent}"
                </Text>
              </View>

              {/* Motivos */}
              <Text style={styles.sectionLabel}>Motivo del reporte</Text>
              {REPORT_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[styles.reasonItem, selectedReason === reason && styles.reasonItemSelected]}
                  onPress={() => { setSelectedReason(reason); setError(''); }}
                >
                  <Ionicons
                    name={selectedReason === reason ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={selectedReason === reason ? COLORS.primary : COLORS.textRoomsTertiary}
                  />
                  <Text style={[styles.reasonText, selectedReason === reason && styles.reasonTextSelected]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Descripción opcional */}
              <Text style={styles.sectionLabel}>Descripción (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Agrega detalles adicionales..."
                placeholderTextColor={COLORS.placeholderTextColor}
                value={description}
                onChangeText={setDescription}
                multiline
                maxLength={300}
              />

              {/* Error */}
              {!!error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Botón enviar */}
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.textWhite} size="small" />
                ) : (
                  <Text style={styles.submitText}>Enviar reporte</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
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
    maxHeight: '85%',
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: SPACING.sm,
    borderRadius: 12,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  messageText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textRoomsMuted,
    fontStyle: 'italic',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textRoomsSecondary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  reasonItemSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  reasonText: {
    fontSize: 14,
    color: COLORS.textRoomsTertiary,
  },
  reasonTextSelected: {
    color: COLORS.textWhite,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
    padding: SPACING.sm,
    color: COLORS.textWhite,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.sm,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
  },
  submitButton: {
    backgroundColor: COLORS.error,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    gap: 10,
  },
  successText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
  successSub: {
    fontSize: 13,
    color: COLORS.textRoomsTertiary,
    textAlign: 'center',
  },
});

export default ReportMessageModal;
