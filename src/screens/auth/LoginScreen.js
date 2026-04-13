import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { COLORS } from '../../styles/colors';
import { authService } from '../../services/auth';
import { Button, Input } from '../../components/ui';
import { validateEmail } from '../../utils/validators';

import { authStyles } from '../../styles/authStyles';

const styles = authStyles;

const LoginScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { data, error } = await authService.login(formData.email, formData.password);

      if (error) {
        Alert.alert('Error', error.message || 'Credenciales incorrectas');
      } else {
        Alert.alert('Éxito', 'Inicio de sesión correcto');
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
    <View style={styles.containerCentered}>
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
  );
};

export default LoginScreen;
