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
import { COLORS } from '../../styles/colors';
import { authService } from '../../services/auth';

import { Button, Input } from '../../components/ui';
import { validateEmail } from '../../utils/validators';

import { authStyles as styles } from '../../styles/authStyles';

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!termsAccepted) {
      newErrors.terms = 'Debes aceptar los términos y condiciones';
    }

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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.title}>Únete a OpenStudy</Text>
        <Text style={styles.description}>Crea tu cuenta y empieza a estudiar mejor</Text>
      </LinearGradient>

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
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setTermsAccepted(!termsAccepted)}
            disabled={isLoading}
          >
            <View style={[styles.checkboxInner, termsAccepted && styles.checkboxChecked]}>
              {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
          <View style={styles.termsTextContainer}>
            <Text style={styles.termsTextPrefix}>Acepto los</Text>
            <TouchableOpacity
              style={styles.termsLinkWrapper}
              onPress={() => navigation.navigate('Terms')}
              disabled={isLoading}
            >
              <Text style={styles.termsLink}>términos y condiciones</Text>
            </TouchableOpacity>
          </View>
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
  );
};

export default RegisterScreen;
