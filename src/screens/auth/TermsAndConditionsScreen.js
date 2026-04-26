import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles';

const TermsAndConditionsScreen = ({ navigation }) => {
  return (
    <LinearGradient
      colors={COLORS.gradientRooms}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Términos y Condiciones</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introducción</Text>
          <Text style={styles.sectionText}>
            Bienvenido a OpenStudy. Al utilizar nuestra plataforma, aceptas estos términos y condiciones. 
            Por favor, léelos detenidamente antes de usar nuestros servicios.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Uso de la Plataforma</Text>
          <Text style={styles.sectionText}>
            OpenStudy es una plataforma diseñada para facilitar el estudio colaborativo. 
            Te comprometes a utilizar la plataforma de manera responsable y respetuosa con otros usuarios.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Responsabilidades del Usuario</Text>
          <Text style={styles.sectionText}>
            Como usuario de OpenStudy, eres responsable de:
          </Text>
          <Text style={styles.sectionText}>
            • Mantener la confidencialidad de tu cuenta y contraseña
          </Text>
          <Text style={styles.sectionText}>
            • No compartir contenido inapropiado o ofensivo
          </Text>
          <Text style={styles.sectionText}>
            • Respetar las reglas de las salas de estudio que crees o a las que te unas
          </Text>
          <Text style={styles.sectionText}>
            • Reportar cualquier comportamiento inapropiado
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Privacidad de Datos</Text>
          <Text style={styles.sectionText}>
            OpenStudy se compromete a proteger tu privacidad. Tus datos personales serán 
            utilizados únicamente para los fines descritos en nuestra política de privacidad.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Propiedad Intelectual</Text>
          <Text style={styles.sectionText}>
            Todo el contenido de OpenStudy, incluyendo但不限于 texto, gráficos, logotipos, 
            imágenes y software, es propiedad de OpenStudy o sus licenciantes y está protegido 
            por las leyes de propiedad intelectual.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Modificaciones</Text>
          <Text style={styles.sectionText}>
            OpenStudy se reserva el derecho de modificar estos términos y condiciones en cualquier momento. 
            Se te notificará de cualquier cambio significativo.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Contacto</Text>
          <Text style={styles.sectionText}>
            Si tienes preguntas sobre estos términos y condiciones, por favor contáctanos a:
          </Text>
          <Text style={styles.sectionText}>
            Email: soporte@openstudy.com
          </Text>
        </View>

        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.acceptButtonText}>Aceptar</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.rooms.paddingX,
    paddingTop: SPACING.rooms.paddingTop,
    paddingBottom: SPACING.rooms.paddingBottom,
  },
  title: {
    ...TYPOGRAPHY.rooms.title,
    color: COLORS.textWhite,
    marginBottom: SPACING.rooms.marginBottomLarge,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.rooms.marginBottomLarge,
    paddingBottom: SPACING.rooms.marginBottomMedium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderRoomsMedium,
  },
  sectionTitle: {
    ...TYPOGRAPHY.rooms.sectionTitle,
    color: COLORS.textWhite,
    marginBottom: SPACING.rooms.marginBottomSmall,
  },
  sectionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsSecondary,
    marginBottom: SPACING.rooms.marginBottomSmall,
    lineHeight: 22,
  },
  acceptButton: {
    backgroundColor: COLORS.filterChipSelected,
    borderRadius: SPACING.borderRadiusRooms.button,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: SPACING.rooms.marginBottomLarge,
    shadowColor: COLORS.shadowRooms,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  acceptButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textWhite,
    fontWeight: TYPOGRAPHY.rooms.title.fontWeight,
  },
});

export default TermsAndConditionsScreen;
