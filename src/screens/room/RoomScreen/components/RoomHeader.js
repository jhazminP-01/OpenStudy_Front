import React from 'react';
import { View, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../styles';
import styles from '../RoomScreen.styles';

const RoomHeader = ({ roomName, onLeave, leaving, userWarnings = 0 }) => {
  // Determinar color según cantidad de advertencias
  const getWarningColor = (count) => {
    if (count === 0) return 'rgba(255,255,255,0.5)';
    if (count === 1) return '#F59E0B'; // Amarillo/naranja
    if (count === 2) return '#EA580C'; // Naranja fuerte
    return '#DC2626'; // Rojo (3+)
  };

  const warningColor = getWarningColor(userWarnings);

  return (
    <View style={styles.header}>
      {/* Contador de advertencias - Lado izquierdo */}
      <View style={[styles.warningBadge, { borderColor: warningColor, backgroundColor: warningColor + '15' }]}>
        <Ionicons name="warning-outline" size={14} color={warningColor} />
        <Text style={[styles.warningText, { color: warningColor }]}>
          {userWarnings}/3
        </Text>
      </View>

      {/* Nombre de sala - Centro */}
      <Text style={styles.roomTitle} numberOfLines={1} ellipsizeMode="tail">
        {roomName}
      </Text>
      
      {/* Botón salir - Lado derecho */}
      <TouchableOpacity
        style={styles.headerButton}
        onPress={onLeave}
        disabled={leaving}
      >
        {leaving ? (
          <ActivityIndicator color={COLORS.textWhite} size="small" />
        ) : (
          <Ionicons name="exit-outline" size={20} color={COLORS.error} />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default RoomHeader;
