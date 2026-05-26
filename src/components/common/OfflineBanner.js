import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

const OfflineBanner = () => {
  const { isConnected, isCheckingReconnect } = useNetworkStatus();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: isConnected ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isConnected, opacity]);

  if (isConnected && !isCheckingReconnect) return null;

  // Banner pequeño al reconectar
  if (isCheckingReconnect) {
    return (
      <View style={styles.reconnectingBanner} pointerEvents="none">
        <Ionicons name="wifi" size={14} color="#fff" />
        <Text style={styles.reconnectingText}>Conexión restaurada</Text>
      </View>
    );
  }

  // Overlay bloqueante sin internet
  return (
    <Animated.View style={[styles.overlay, { opacity }]} pointerEvents="auto">
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="wifi-outline" size={48} color="#ef4444" />
        </View>
        <Text style={styles.title}>Sin conexión</Text>
        <Text style={styles.subtitle}>
          OpenStudy necesita internet para funcionar.{'\n'}
          Revisa tu conexión e inténtalo de nuevo.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {}}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh-outline" size={16} color="#fff" />
          <Text style={styles.retryText}>Verificando automáticamente...</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: 'rgba(10, 10, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  retryText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  reconnectingBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: '#22c55e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  reconnectingText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default OfflineBanner;
