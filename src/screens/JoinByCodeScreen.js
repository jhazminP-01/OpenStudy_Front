import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../styles';
import { Ionicons } from '@expo/vector-icons';
import { roomsService } from '../services/rooms';
import { useAuth } from '../hooks/useAuth';
import AppModal from '../components/ui/ErrorModal';

export default function JoinByCodeScreen({ navigation }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, type: 'error', title: '', message: '' });
  const { user } = useAuth();

  const handleJoinByCode = async () => {
    if (!code.trim()) {
      setErrorModal({
        visible: true,
        type: 'error',
        title: 'Código vacío',
        message: 'Por favor ingresa un código de invitación'
      });
      return;
    }

    if (!user?.id) {
      setErrorModal({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'Debes iniciar sesión para unirte a una sala'
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await roomsService.joinRoomByCode(code.trim(), user.id);

      if (error) {
        setErrorModal({
          visible: true,
          type: 'error',
          title: 'Error',
          message: error.message || 'Error al unirse a la sala'
        });
        setLoading(false);
      } else if (data && data.id) {
        // Reemplazar pantalla para que al salir vuelva a la lista
        navigation.replace('Room', { roomId: data.id });
      } else {
        setErrorModal({
          visible: true,
          type: 'error',
          title: 'Error',
          message: 'No se pudo obtener la información de la sala'
        });
        setLoading(false);
      }
    } catch (err) {
      setErrorModal({
        visible: true,
        type: 'error',
        title: 'Error',
        message: err.message || 'Ocurrió un error inesperado'
      });
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={COLORS.gradientRooms}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color={COLORS.textWhite} />
          </TouchableOpacity>
          <Text style={styles.title}>Unirse con código</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="key-outline" size={64} color={COLORS.iconSuccess} />
        </View>

        {/* Description */}
        <Text style={styles.description}>
          Ingresa el código de invitación que te compartieron
        </Text>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Código de invitación"
            placeholderTextColor={COLORS.textRoomsTertiary}
            value={code}
            onChangeText={setCode}
            maxLength={20}
            autoCapitalize="characters"
            editable={!loading}
          />
        </View>

        {/* Button */}
        <TouchableOpacity
          style={styles.buttonWrapper}
          onPress={handleJoinByCode}
          disabled={loading}
        >
          <LinearGradient
            colors={COLORS.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.button, loading && { opacity: 0.6 }]}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.textWhite} size="small" />
            ) : (
              <Text style={styles.buttonText}>Unirse a la sala</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Help text */}
        <Text style={styles.helpText}>
          Pide el código a quien creó la sala
        </Text>
      </View>

      <AppModal
        visible={errorModal.visible}
        type={errorModal.type}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() => setErrorModal({ visible: false, type: 'error', title: '', message: '' })}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: SPACING.rooms.paddingX,
    paddingVertical: SPACING.rooms.paddingY,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.rooms.marginBottomLarge,
    paddingTop: 10,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    ...TYPOGRAPHY.rooms.title,
    color: COLORS.textWhite,
    textAlign: 'center',
    flex: 1,
  },

  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.rooms.marginBottomLarge,
    backgroundColor: COLORS.successIconBg,
    borderWidth: 1,
    borderColor: COLORS.successIconBorder,
    shadowColor: COLORS.shadowRooms,
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsSecondary,
    textAlign: 'center',
    marginBottom: SPACING.rooms.marginBottomLarge,
  },

  inputContainer: {
    marginBottom: SPACING.rooms.marginBottomLarge,
  },

  input: {
    backgroundColor: COLORS.cardRoomsBackground,
    borderRadius: SPACING.borderRadiusRooms.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.textWhite,
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
    ...TYPOGRAPHY.body,
    fontSize: 16,
  },

  buttonWrapper: {
    marginBottom: SPACING.rooms.marginBottomMedium,
  },

  button: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadowRooms,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: COLORS.textWhite,
    ...TYPOGRAPHY.body,
    fontWeight: '800',
  },

  helpText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsTertiary,
    textAlign: 'center',
    fontSize: 12,
  },
});
