import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../styles';
import styles from '../ModalRoomDetails.styles';

const AVATAR_COLORS = [
  '#7c3aed', '#2563eb', '#059669', '#d97706',
  '#dc2626', '#7c3aed', '#0891b2', '#be185d',
];

const getInitials = (nombre) => {
  if (!nombre) return '?';
  const parts = nombre.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].charAt(0).toUpperCase();
};

const ParticipantsAvatars = ({ participants, maxVisible = 5 }) => {
  const count = participants.length;
  const visible = participants.slice(0, maxVisible);
  const overflow = count - maxVisible;

  if (count === 0) return null;

  return (
    <View style={localStyles.row}>
      {visible.map((participant, index) => {
        const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
        const initials = getInitials(participant.nombre_completo);
        return (
          <View key={participant.id || index} style={localStyles.avatarWrapper}>
            <View style={[localStyles.avatar, { backgroundColor: color }]}>
              <Text style={localStyles.initials}>{initials}</Text>
            </View>
            {participant.rol === 'moderador' && (
              <View style={localStyles.crown}>
                <Ionicons name="star" size={8} color="#fbbf24" />
              </View>
            )}
          </View>
        );
      })}
      {overflow > 0 && (
        <View style={[localStyles.avatar, localStyles.overflowAvatar]}>
          <Text style={localStyles.overflowText}>+{overflow}</Text>
        </View>
      )}
    </View>
  );
};

const localStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  initials: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  crown: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#1e1b4b',
    borderRadius: 6,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overflowAvatar: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  overflowText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default ParticipantsAvatars;
