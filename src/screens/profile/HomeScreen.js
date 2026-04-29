import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles';
import { authService } from '../../services/auth';
import { useAuth } from '../../hooks/useAuth';

import { Card, Button } from '../../components/ui';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  
  const handleLogout = async () => {
    await authService.logout();
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>OpenStudy</Text>
        <Text style={styles.headerSubtitle}>¡Hola, {user?.user_metadata?.username || user?.email}!</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Card style={styles.userInfo}>
          <Text style={styles.sectionTitle}>Información de Usuario</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID:</Text>
            <Text style={styles.infoValue}>{user?.id?.slice(0, 8)}...</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estado:</Text>
            <Text style={[styles.infoValue, styles.statusActive]}>Activo</Text>
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Próximamente</Text>
          <Text style={styles.sectionText}>
            - Salas de estudio colaborativo{'\n'}
            - Temporizador Pomodoro grupal{'\n'}
            - Chat en tiempo real{'\n'}
            - Estadísticas de estudio
          </Text>
        </Card>

        <Button 
          title="Cerrar Sesión" 
          variant="error" 
          onPress={handleLogout}
          style={styles.logoutButton}
        />
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
    padding: SPACING.xl,
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.rooms.title,
    color: COLORS.textWhite,
    marginBottom: SPACING.rooms.marginBottomSmall,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textWhite,
    opacity: 0.9,
  },
  content: {
    padding: SPACING.md,
  },
  userInfo: {
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    ...TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.h3.fontWeight,
    color: COLORS.text,
  },
  infoValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  statusActive: {
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.h3.fontWeight,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  logoutButton: {
    marginTop: SPACING.md,
  },
});

export default HomeScreen;
