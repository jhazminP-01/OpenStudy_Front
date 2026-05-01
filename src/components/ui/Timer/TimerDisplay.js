import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../styles';

const TimerDisplay = ({
  timeLeft,
  formattedTime,
  phase,
  status,
  progress,
  size = 200,
}) => {
  const isStudyPhase = phase === 'estudio';
  const isActive = status === 'activo';
  const isPaused = status === 'pausado';
  
  // Colores según fase
  const phaseColor = isStudyPhase ? COLORS.primary : COLORS.secondary;
  const statusColor = isActive ? phaseColor : COLORS.textRoomsTertiary;
  
  // Calcular dimensión del círculo
  const radius = (size - 20) / 2;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Círculo de fondo - SVG estático completo */}
      <Svg style={StyleSheet.absoluteFill} height={size} width={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.border}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
      </Svg>
      
      {/* Círculo de progreso - SVG dinámico */}
      <Svg style={StyleSheet.absoluteFill} height={size} width={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={statusColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      
      {/* Contenido central */}
      <View style={StyleSheet.absoluteFill}>
        <View style={styles.content}>
          {/* Indicador de estado */}
          <View style={styles.statusIndicator}>
            {isPaused && (
              <Ionicons 
                name="pause-circle" 
                size={24} 
                color={COLORS.warning} 
              />
            )}
            {isActive && (
              <Ionicons 
                name="play-circle" 
                size={24} 
                color={phaseColor} 
              />
            )}
          </View>
          
          {/* Tiempo formateado */}
          <Text style={[styles.timeText, { color: statusColor }]}>
            {formattedTime}
          </Text>
          
          {/* Fase actual */}
          <Text style={styles.phaseText}>
            {isStudyPhase ? 'Tiempo de Estudio' : 'Tiempo de Descanso'}
          </Text>
          
          {/* Estado */}
          <Text style={styles.statusText}>
            {isPaused ? 'Pausado' : isActive ? 'Activo' : 'Detenido'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    marginBottom: 4,
  },
  timeText: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'System',
    marginBottom: 4,
  },
  phaseText: {
    fontSize: 12,
    color: COLORS.textRoomsSecondary,
    marginBottom: 2,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  statusText: {
    fontSize: 10,
    color: COLORS.textRoomsTertiary,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});

export default TimerDisplay;
