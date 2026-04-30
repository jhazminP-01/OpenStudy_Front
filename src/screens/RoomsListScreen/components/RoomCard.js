import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../styles';
import styles from '../RoomsListScreen.styles';

const RoomCard = ({
  room,
  participantsCount,
  statusInfo,
  theme,
  isJoining,
  isFull,
  onViewDetails,
  onJoin,
}) => {
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onViewDetails}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeaderRow}>
        <View style={[styles.iconBox, theme.iconBoxStyle]}>
          <Ionicons
            name={theme.icon}
            size={22}
            color={theme.color}
          />
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardTopRow}>
            <Text style={styles.categoryBadge}>
              {room.materia?.nombre?.toUpperCase() || 'MATERIA'}
            </Text>

            <View style={[styles.statusBadge, statusInfo.containerStyle]}>
              <Text style={[styles.statusText, statusInfo.textStyle]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>

          <Text style={styles.roomTitle}>{room.nombre}</Text>

          {!!room.descripcion && (
            <Text style={styles.roomDescription} numberOfLines={2}>
              {room.descripcion}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="people-outline" size={16} color={COLORS.textRoomsTertiary} />
          <Text style={[styles.infoText, isFull && styles.fullCapacityText]}>
            {participantsCount}/{room.capacidad_maxima} participantes
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="key-outline" size={16} color={COLORS.iconCode} />
          <Text style={styles.infoText}>{room.codigo_invitacion}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.enterButton, theme.buttonStyle, isFull && styles.enterButtonDisabled]}
        onPress={onJoin}
        disabled={isJoining || isFull}
      >
        {isJoining ? (
          <ActivityIndicator color={COLORS.textWhite} size="small" />
        ) : (
          <Text style={styles.enterButtonText}>
            {isFull ? 'Sala llena' : 'Entrar'}
          </Text>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default RoomCard;
