import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles';
import { authService } from '../../services/auth';
import { Button, Input } from '../../components/ui';
import { useAuthValidation } from '../../hooks/useAuthValidation';
import { useBan } from '../../hooks/useBan';

const LoginScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { validateLogin } = useAuthValidation();
  const { setBan } = useBan();

  const validateForm = () => {
    const newErrors = validateLogin(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { data, error } = await authService.login(formData.email, formData.password);

      if (error) {
        if (error.message === 'USER_BANNED') {
          setBan(error.banData);
        } else {
          Alert.alert('Error', error.message || 'Credenciales incorrectas');
        }
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
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <LinearGradient
      colors={COLORS.gradientRooms}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <Text style={styles.title}>OpenStudy</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

        <View style={styles.form}>
          <Input
            label="Correo Electrónico"
            placeholder="tu@email.com"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            error={errors.email}
            keyboardType="email-address"
          />

          <Input
            label="Contraseña"
            placeholder="******"
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            error={errors.password}
            secureTextEntry
          />

          <Button
            title="Iniciar Sesión"
            onPress={handleLogin}
            isLoading={isLoading}
          />

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.linkText}>
              ¿No tienes cuenta? <Text style={{ fontWeight: 'bold' }}>Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
  linkButton: {
    marginTop: SPACING.rooms.marginBottomMedium,
    alignItems: 'center',
  },
  linkText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsSecondary,
  },
});

export default LoginScreen;
