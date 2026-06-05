import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles';

const AppModal = ({ visible, type = 'info', title, message, onClose, buttonText = 'Entendido' }) => {
  const getIconAndColor = () => {
    switch (type) {
      case 'error':
        return { icon: 'alert-circle', color: COLORS.error };
      case 'success':
        return { icon: 'checkmark-circle', color: COLORS.statusActive };
      case 'info':
        return { icon: 'information-circle', color: COLORS.primary };
      case 'warning':
        return { icon: 'warning', color: COLORS.statusPaused };
      default:
        return { icon: 'information-circle', color: COLORS.primary };
    }
  };

  const { icon, color } = getIconAndColor();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={COLORS.gradientRooms}
          style={styles.modalContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={60} color={color} />
          </View>

          <Text style={styles.title}>{title}</Text>

          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={onClose}>
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContainer: {
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
  },
  iconContainer: {
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textWhite,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.textWhite,
    marginBottom: SPACING.xl,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    width: '100%',
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textWhite,
    fontWeight: 'bold',
  },
});

export default AppModal;
