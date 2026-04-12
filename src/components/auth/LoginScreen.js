import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { supabase } from '../../../lib/supabase';

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
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
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

    console.log('Intentando login con:', { email: formData.email, password: formData.password });
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
        options: {
          captcha: undefined
        }
      });

      console.log('Respuesta de Supabase:', { data, error });

      if (error) {
        Alert.alert('Error', error.message || 'Credenciales incorrectas');
      } else {
        Alert.alert('Éxito', 'Inicio de sesión correcto');
        navigation.navigate('Home');
      }
    } catch (error) {
      console.log('Error catch:', error);
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
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      <Text style={styles.subtitle}>Bienvenido a OpenStudy</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder=""
          value={formData.email}
          onChangeText={(value) => updateFormData('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder=""
          value={formData.password}
          onChangeText={(value) => updateFormData('password', value)}
          secureTextEntry
          editable={!isLoading}
        />
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Register')}
          disabled={isLoading}
        >
          <Text style={styles.linkText}>
            ¿No tienes cuenta? Regístrate
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: COLORS.textLight,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textWhite,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 8,
    backgroundColor: COLORS.inputBackground,
    fontSize: 16,
    color: COLORS.textWhite,
  },
  inputError: {
    borderColor: COLORS.inputBorderError,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginBottom: 16,
    marginTop: -8,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
  },
  buttonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 14,
  },
});

export default LoginScreen;
