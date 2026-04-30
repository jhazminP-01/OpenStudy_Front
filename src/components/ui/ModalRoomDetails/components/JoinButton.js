import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../../../styles';
import styles from '../ModalRoomDetails.styles';

const JoinButton = ({ onPress, isJoining, isFull, isActive }) => {
  const isDisabled = isJoining || isFull || !isActive;
  
  const gradientColors = isDisabled 
    ? COLORS.gradientDisabled || ['#666666', '#444444']
    : COLORS.gradientButton;

  const buttonText = isJoining 
    ? 'Cargando...'
    : isFull 
    ? 'Sala llena'
    : !isActive 
    ? 'Sala inactiva'
    : 'Unirse a sala';

  return (
    <TouchableOpacity
      style={[styles.joinButton, isDisabled && styles.joinButtonDisabled]}
      onPress={onPress}
      disabled={isDisabled}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.joinButtonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {isJoining ? (
          <ActivityIndicator color={COLORS.textWhite} size="small" />
        ) : (
          <Text style={styles.joinButtonText}>{buttonText}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default JoinButton;
