import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles';
import { authService } from '../../services/auth';

import { Button, Input, Checkbox } from '../../components/ui';
import { useAuthValidation } from '../../hooks/useAuthValidation';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { validateRegister } = useAuthValidation();

  const validateForm = () => {
    const newErrors = validateRegister(formData, termsAccepted);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { error } = await authService.register(formData.email, formData.password, {
        username: formData.username
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setErrors({ email: 'El correo electrónico ya está registrado' });
        } else {
          Alert.alert('Error', error.message || 'Error al registrar usuario');
        }
      } else {
        Alert.alert('Éxito', 'Usuario registrado correctamente. Revisa tu correo para confirmar.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <LinearGradient
      colors={COLORS.gradientRooms}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Únete a OpenStudy</Text>
          <Text style={styles.description}>Crea tu cuenta y empieza a estudiar mejor</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Nombre de usuario"
            placeholder="Ej: juan_perez"
            value={formData.username}
            onChangeText={(value) => updateFormData('username', value)}
            error={errors.username}
            editable={!isLoading}
          />

          <Input
            label="Correo electrónico"
            placeholder="tu@email.com"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            error={errors.email}
            keyboardType="email-address"
            editable={!isLoading}
          />

          <Input
            label="Contraseña"
            placeholder="******"
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            error={errors.password}
            secureTextEntry
            editable={!isLoading}
          />

          <Input
            label="Confirmar contraseña"
            placeholder="******"
            value={formData.confirmPassword}
            onChangeText={(value) => updateFormData('confirmPassword', value)}
            error={errors.confirmPassword}
            secureTextEntry
            editable={!isLoading}
          />

          <View style={styles.termsContainer}>
            <Checkbox
              checked={termsAccepted}
              onPress={() => setTermsAccepted(!termsAccepted)}
              disabled={isLoading}
            />
            <Text style={styles.termsText}>
              Acepto los{' '}
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => navigation.navigate('TermsAndConditions')}
              >
                <Text style={styles.termsLink}>
                  términos y condiciones
                </Text>
              </TouchableOpacity>
            </Text>
          </View>
          {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

          <Button
            title="Registrarse"
            onPress={handleRegister}
            isLoading={isLoading}
          />

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Login')}
            disabled={isLoading}
          >
            <Text style={styles.linkText}>
              ¿Ya tienes cuenta? <Text style={{ fontWeight: 'bold' }}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingTop: SPACING.rooms.paddingTop,
  },
  header: {
    marginBottom: SPACING.rooms.marginBottomLarge,
  },
  title: {
    ...TYPOGRAPHY.rooms.title,
    color: COLORS.textWhite,
    marginBottom: SPACING.rooms.marginBottomSmall,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsSecondary,
  },
  form: {
    gap: SPACING.rooms.gapMedium,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.rooms.marginTop,
  },
  termsText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsSecondary,
  },
  termsLink: {
    ...TYPOGRAPHY.body,
    color: COLORS.filterChipSelected,
    textDecorationLine: 'underline',
  },
  errorText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textRoomsError,
    marginTop: SPACING.rooms.marginBottomSmall,
  },
  linkButton: {
    marginTop: SPACING.rooms.marginBottomMedium,
    alignItems: 'center',
  },
  linkText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsSecondary,
  },
});

export default RegisterScreen;
