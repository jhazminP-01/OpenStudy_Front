import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';
import { supabase } from '../../../lib/supabase';

const HomeScreen = ({ navigation }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.navigate('Welcome');
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
          <Text style={styles.title}>Bienvenido a OpenStudy</Text>
          <Text style={styles.subtitle}>Tu plataforma de estudio</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mis Cursos</Text>
          <Text style={styles.cardDescription}>Accede a tus cursos activos</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estadísticas</Text>
          <Text style={styles.cardDescription}>Tu progreso y rendimiento</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Comunidad</Text>
          <Text style={styles.cardDescription}>Conecta con otros estudiantes</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textWhite,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.backgroundCard,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textWhite,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
