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
import { COLORS } from '../../constants/colors';

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
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
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
      // TODO: Implementar llamada a la API
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Éxito', 'Usuario registrado correctamente');
        navigation.navigate('Login');
      } else {
        if (response.status === 409) {
          setErrors({ email: 'El correo electrónico ya está registrado' });
        } else {
          Alert.alert('Error', data.message || 'Error al registrar usuario');
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
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Únete a OpenStudy</Text>
          </View>
        </View>
        <Text style={styles.description}>Crea tu cuenta y empieza a estudiar mejor</Text>
      </LinearGradient>

      <View style={styles.form}>
        <Text style={styles.label}>Nombre de usuario</Text>
        <TextInput
          style={[styles.input, errors.username && styles.inputError]}
          placeholder=""
          value={formData.username}
          onChangeText={(value) => updateFormData('username', value)}
          editable={!isLoading}
        />
        {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

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

        <Text style={styles.label}>Confirmar contraseña</Text>
        <TextInput
          style={[styles.input, errors.confirmPassword && styles.inputError]}
          placeholder=""
          value={formData.confirmPassword}
          onChangeText={(value) => updateFormData('confirmPassword', value)}
          secureTextEntry
          editable={!isLoading}
        />
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

        <View style={styles.termsContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setTermsAccepted(!termsAccepted)}
            disabled={isLoading}
          >
            <View style={[styles.checkboxInner, termsAccepted && styles.checkboxChecked]}>
              {termsAccepted && <Text style={styles.checkmark}>×</Text>}
            </View>
          </TouchableOpacity>
          <Text style={styles.termsText}>
            Acepto los términos y condiciones
          </Text>
        </View>
        {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Registrarse</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Login')}
          disabled={isLoading}
        >
          <Text style={styles.linkText}>
            ¿Ya tienes cuenta? Inicia sesión
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    marginTop: 50,
    marginHorizontal: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  backArrow: {
    fontSize: 28,
    color: COLORS.textWhite,
    fontWeight: 'bold',
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textWhite,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  form: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 30,
    marginTop: -20,
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    marginRight: 8,
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.textWhite,
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 14,
    color: COLORS.textWhite,
    flex: 1,
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

export default RegisterScreen;
