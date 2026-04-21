import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../styles/colors';

const TermsScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
          </TouchableOpacity>
          
          <View style={styles.headerText}>
            <Text style={styles.title}>Términos y Condiciones</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.lastUpdated}>Última actualización: 15 de Octubre, 2023</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Aceptación de los Términos</Text>
          <Text style={styles.paragraph}>
            Al descargar, instalar o usar la aplicación OpenStudy, aceptas estos términos y condiciones en su totalidad. Si no estás de acuerdo con estos términos, no debes usar la aplicación.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Descripción del Servicio</Text>
          <Text style={styles.paragraph}>
            OpenStudy es una aplicación móvil diseñada para facilitar sesiones de estudio colaborativo utilizando la técnica Pomodoro. Los usuarios pueden crear salas de estudio, unirse a salas existentes, participar en chat en tiempo real y sincronizar temporizadores de estudio.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Responsabilidades del Usuario</Text>
          <Text style={styles.paragraph}>- Proporcionar información veraz y actualizada</Text>
          <Text style={styles.paragraph}>- Mantener la confidencialidad de tu contraseña</Text>
          <Text style={styles.paragraph}>- Utilizar la aplicación para fines educativos</Text>
          <Text style={styles.paragraph}>- Respetar a otros usuarios y mantener un ambiente adecuado</Text>
          <Text style={styles.paragraph}>- No compartir contenido inapropiado u ofensivo</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Privacidad y Datos</Text>
          <Text style={styles.paragraph}>
            Recopilamos información personal como nombre, correo electrónico y estadísticas de estudio. Esta información se utiliza para mejorar el servicio y personalizar la experiencia. No compartimos tu información personal con terceros sin tu consentimiento.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Propiedad Intelectual</Text>
          <Text style={styles.paragraph}>
            OpenStudy y su contenido, incluyendo pero no limitado a software, texto, gráficos, logos e imágenes, son propiedad de OpenStudy y están protegidos por leyes de propiedad intelectual.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Modificaciones del Servicio</Text>
          <Text style={styles.paragraph}>
            Nos reservamos el derecho de modificar, suspender o descontinuar cualquier parte del servicio en cualquier momento, con o sin previo aviso.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Limitación de Responsabilidad</Text>
          <Text style={styles.paragraph}>
            OpenStudy no será responsable por cualquier daño directo, indirecto, incidental o consecuente que resulte del uso o la incapacidad de usar el servicio.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Contacto</Text>
          <Text style={styles.paragraph}>
            Para cualquier pregunta sobre estos términos y condiciones, puedes contactarnos en: support@openstudy.com
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Fecha de Vigencia</Text>
          <Text style={styles.paragraph}>
            Estos términos y condiciones están vigentes a partir del 17 de abril de 2026.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  lastUpdated: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textWhite,
  },
});

export default TermsScreen;
