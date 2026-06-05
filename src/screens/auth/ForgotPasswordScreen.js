import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles';
import { authService } from '../../services/auth';
import { Button, Input } from '../../components/ui';
import AppModal from '../../components/ui/ErrorModal';

const ForgotPasswordScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, type: 'info', title: '', message: '' });

  const translateError = (message) => {
    if (message === 'Token has expired or is invalid') {
      return 'El código es incorrecto o ya expiró';
    }
    if (message === 'Password should be at least 6 characters') {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    return message;
  };

  const handleBack = () => {
    if (step === 1) {
      navigation.goBack();
    } else {
      setStep(step - 1);
    }
  };

  const handleSendCode = async () => {
    if (!email.trim()) {
      setErrorModal({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'Por favor ingresa tu correo electrónico',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await authService.resetPasswordRequest(email);
      if (error) {
        setErrorModal({
          visible: true,
          type: 'error',
          title: 'Error',
          message: translateError(error.message) || 'No se pudo enviar el código',
        });
      } else {
        setStep(2);
      }
    } catch (error) {
      setErrorModal({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudo conectar al servidor',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      setErrorModal({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'El código debe tener 6 dígitos',
      });
      return;
    }
    setStep(3);
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const { error } = await authService.resetPasswordRequest(email);
      if (error) {
        setErrorModal({
          visible: true,
          type: 'error',
          title: 'Error',
          message: translateError(error.message) || 'No se pudo reenviar el código',
        });
      } else {
        setErrorModal({
          visible: true,
          type: 'info',
          title: 'Código reenviado',
          message: 'Revisa tu correo',
        });
      }
    } catch (error) {
      setErrorModal({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudo conectar al servidor',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setErrorModal({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'Las contraseñas no coinciden',
      });
      return;
    }

    if (newPassword.length < 6) {
      setErrorModal({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'La contraseña debe tener al menos 6 caracteres',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await authService.resetPasswordConfirm(email, otp, newPassword);
      if (error) {
        setErrorModal({
          visible: true,
          type: 'error',
          title: 'Error',
          message: translateError(error.message) || 'No se pudo cambiar la contraseña',
        });
      } else {
        setErrorModal({
          visible: true,
          type: 'success',
          title: '¡Listo!',
          message: 'Tu contraseña ha sido cambiada exitosamente',
          onClose: () => navigation.navigate('Login'),
        });
      }
    } catch (error) {
      setErrorModal({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudo conectar al servidor',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <Text style={styles.title}>Recuperar contraseña</Text>
      <Text style={styles.subtitle}>Ingresa tu correo y te enviaremos un código</Text>

      <View style={styles.form}>
        <Input
          label="Correo Electrónico"
          placeholder="tu@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Button
          title="Enviar código"
          onPress={handleSendCode}
          isLoading={isLoading}
        />
      </View>
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.title}>Ingresa el código</Text>
      <Text style={styles.subtitle}>Revisa tu correo {email} y escribe el código de 6 dígitos</Text>

      <View style={styles.form}>
        <Input
          label="Código"
          placeholder="000000"
          value={otp}
          onChangeText={setOtp}
          keyboardType="numeric"
          maxLength={6}
        />

        <Button
          title="Verificar código"
          onPress={handleVerifyOtp}
          isLoading={isLoading}
        />

        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResendCode}
          disabled={isLoading}
        >
          <Text style={styles.resendText}>¿No recibiste el código?</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.title}>Nueva contraseña</Text>
      <Text style={styles.subtitle}>Elige una contraseña segura</Text>

      <View style={styles.form}>
        <Input
          label="Nueva contraseña"
          placeholder="******"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />

        <Input
          label="Confirmar contraseña"
          placeholder="******"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <Button
          title="Cambiar contraseña"
          onPress={handleChangePassword}
          isLoading={isLoading}
        />
      </View>
    </>
  );

  return (
    <LinearGradient
      colors={COLORS.gradientRooms}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
        </TouchableOpacity>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </View>

      <AppModal
        visible={errorModal.visible}
        type={errorModal.type}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() => {
          if (errorModal.onClose) {
            errorModal.onClose();
          }
          setErrorModal({ visible: false, type: 'info', title: '', message: '' });
        }}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.rooms.paddingX,
    paddingTop: SPACING.rooms.paddingTop,
    paddingBottom: SPACING.rooms.paddingBottom,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: SPACING.rooms.paddingTop,
    left: SPACING.rooms.paddingX,
    padding: SPACING.xs,
    zIndex: 10,
  },
  title: {
    ...TYPOGRAPHY.rooms.title,
    color: COLORS.textWhite,
    marginBottom: SPACING.rooms.marginBottomSmall,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsSecondary,
    marginBottom: SPACING.rooms.marginBottomXLarge,
    textAlign: 'center',
  },
  form: {
    gap: SPACING.rooms.gapMedium,
  },
  resendButton: {
    marginTop: SPACING.rooms.marginBottomMedium,
    alignItems: 'center',
  },
  resendText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default ForgotPasswordScreen;
