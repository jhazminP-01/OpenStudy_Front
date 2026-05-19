import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../styles';

const NOTIFICATION_CONFIGS = {
  estudio: {
    icon: 'book-outline',
    title: '¡Bloque de estudio completado!',
    subtitle: 'Es momento de tomar un descanso 🎉',
    color: '#fff',
    bgColor: '#5B21B6',
    borderColor: '#7C3AED',
  },
  descanso: {
    icon: 'cafe-outline',
    title: '¡Descanso terminado!',
    subtitle: 'Volvamos al estudio 💪',
    color: '#fff',
    bgColor: '#065F46',
    borderColor: '#059669',
  },
  descanso_largo: {
    icon: 'moon-outline',
    title: '¡Descanso largo terminado!',
    subtitle: 'Nueva ronda de estudio 🚀',
    color: '#fff',
    bgColor: '#92400E',
    borderColor: '#D97706',
  },
};

const CycleNotification = ({ visible, completedPhase, onDismiss }) => {
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  const config = NOTIFICATION_CONFIGS[completedPhase] || NOTIFICATION_CONFIGS.estudio;

  useEffect(() => {
    if (visible) {
      // Mostrar
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss después de 4 segundos
      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, 4000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onDismiss) onDismiss();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <Ionicons name={config.icon} size={24} color="#fff" />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: '#fff' }]}>{config.title}</Text>
          <Text style={[styles.subtitle, { color: 'rgba(255,255,255,0.8)' }]}>{config.subtitle}</Text>
        </View>
        <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
          <Ionicons name="close" size={18} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    borderRadius: 14,
    borderWidth: 1,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textRoomsSecondary,
  },
  closeButton: {
    padding: 4,
  },
});

export default CycleNotification;
