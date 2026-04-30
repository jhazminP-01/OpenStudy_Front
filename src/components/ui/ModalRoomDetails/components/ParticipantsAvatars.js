import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../styles';
import styles from '../ModalRoomDetails.styles';

const ParticipantsAvatars = ({ participants, maxVisible = 8 }) => {
  const count = participants.length;
  
  if (count === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.avatarsContainer}>
        {participants.slice(0, maxVisible).map((participant) => (
          <View key={participant.id} style={styles.participantAvatar}>
            <View style={[styles.avatarSmall, styles.defaultAvatarSmall]}>
              <Ionicons name="person" size={16} color={COLORS.textWhite} />
            </View>
            {participant.rol === 'moderador' && (
              <View style={styles.crownSmall}>
                <Ionicons name="star" size={8} color={COLORS.accent} />
              </View>
            )}
          </View>
        ))}
        {count > maxVisible && (
          <View style={styles.moreParticipants}>
            <Text style={styles.moreText}>+{count - maxVisible}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ParticipantsAvatars;
