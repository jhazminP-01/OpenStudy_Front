import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles';
import { useBan } from '../../hooks/useBan';

const BannedScreen = ({ route }) => {
  const { banData } = route.params || {};
  const { clearBan } = useBan();
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    if (!banData || banData.es_permanente) return;

    // Calcular tiempo restante inicial
    const calculateTimeRemaining = () => {
      const endDate = new Date(banData.fecha_fin_baneo);
      const now = new Date();
      const diffMs = endDate - now;

      if (diffMs <= 0) {
        clearBan();
        return null;
      }

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      if (days > 0) {
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
      } else if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      } else {
        return `${seconds}s`;
      }
    };

    setTimeRemaining(calculateTimeRemaining());

    // Timer que actualiza cada segundo
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [banData, clearBan]);

  const handleCloseApp = () => {
    BackHandler.exitApp();
  };

  if (!banData) {
    return (
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="ban" size={80} color={COLORS.error} />
          </View>
          <Text style={styles.title}>Cuenta suspendida</Text>
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>
              No pudimos cargar los datos de tu baneo. Intenta iniciar sesión nuevamente.
            </Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleCloseApp}>
            <Text style={styles.buttonText}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const getExpulsionText = (numero) => {
    if (numero === 1) return '1ra expulsión';
    if (numero === 2) return '2da expulsión';
    return '3ra expulsión';
  };

  const getDurationText = () => {
    if (banData.es_permanente) {
      return 'Tu cuenta ha sido deshabilitada permanentemente';
    }
    return `Tiempo restante: ${timeRemaining || 'calculando...'}`;
  };

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="ban" size={80} color={COLORS.error} />
        </View>

        <Text style={styles.title}>Cuenta suspendida</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="alert-circle" size={20} color={COLORS.warning} />
            <Text style={styles.infoLabel}>Motivo:</Text>
            <Text style={styles.infoValue}>{banData.motivo}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="warning" size={20} color={COLORS.primary} />
            <Text style={styles.infoLabel}>Expulsión:</Text>
            <Text style={styles.infoValue}>{getExpulsionText(banData.numero_expulsion)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color={COLORS.textRoomsSecondary} />
            <Text style={styles.infoLabel}>Estado:</Text>
            <Text style={[styles.infoValue, banData.es_permanente ? styles.permanentText : styles.temporalText]}>
              {getDurationText()}
            </Text>
          </View>
        </View>

        <View style={styles.messageContainer}>
          <Text style={styles.messageTitle}>¿Qué significa esto?</Text>
          <Text style={styles.messageText}>
            {banData.es_permanente
              ? 'Tu cuenta ha sido deshabilitada permanentemente debido a múltiples violaciones de las normas de la comunidad.'
              : 'Has sido suspendido temporalmente por violar las normas de la comunidad. No podrás acceder a la aplicación hasta que termine el periodo de suspensión.'}
          </Text>
        </View>

        {!banData.es_permanente && (
          <View style={styles.tipContainer}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.tipText}>
              Las expulsiones son progresivas: 1 día → 1 semana → permanente
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleCloseApp}>
          <Text style={styles.buttonText}>Entendido</Text>
        </TouchableOpacity>
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl * 2,
    paddingBottom: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textWhite,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  infoCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  infoLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsSecondary,
    fontWeight: '600',
    minWidth: 80,
  },
  infoValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.textWhite,
    flex: 1,
  },
  permanentText: {
    color: COLORS.error,
    fontWeight: 'bold',
  },
  temporalText: {
    color: COLORS.warning,
    fontWeight: '600',
  },
  messageContainer: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  messageTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textWhite,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  messageText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsMuted,
    lineHeight: 22,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  tipText: {
    ...TYPOGRAPHY.small,
    color: COLORS.primary,
    flex: 1,
  },
  button: {
    width: '100%',
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  buttonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textWhite,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default BannedScreen;
