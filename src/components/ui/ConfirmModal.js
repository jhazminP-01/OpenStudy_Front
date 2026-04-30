import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles';
import { Ionicons } from '@expo/vector-icons';

const ConfirmModal = ({
  visible,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  loading = false,
  icon = 'help-circle',
  iconColor = COLORS.textWhite,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header con icono */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name={icon} size={32} color={iconColor} />
            </View>
          </View>

          {/* Contenido */}
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>

          {/* Botones */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={onConfirm}
              disabled={loading}
            >
              <LinearGradient
                colors={COLORS.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.textWhite} size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>{confirmText}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
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

  modalContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: SPACING.borderRadiusRooms.card,
    width: '100%',
    maxWidth: 500,
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },

  header: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },

  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },

  title: {
    ...TYPOGRAPHY.rooms.cardTitle,
    color: COLORS.textWhite,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },

  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  buttons: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xs,
    paddingBottom: SPACING.lg,
    gap: SPACING.sm,
  },

  button: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 140,
  },

  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
  },

  cancelButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsTertiary,
    fontWeight: '600',
    fontSize: 16,
  },

  confirmButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    minWidth: 140,
  },

  confirmButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textWhite,
    fontWeight: '700',
    fontSize: 16,
  },

  confirmButtonGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    shadowColor: COLORS.shadowRooms,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default ConfirmModal;
