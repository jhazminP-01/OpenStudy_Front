import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../styles';
import { messagesService } from '../../../services/messages';
import styles from './Chat.styles';

const MessageBubble = ({
  message,
  isOwn,
  user,
  onLongPress,
  showError,
}) => {
  const formatTime = messagesService.formatMessageTime;

  const getInitials = (nombre) => {
    if (!nombre) return '?';
    const parts = nombre.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].charAt(0).toUpperCase();
  };

  const userName = user?.nombre || message.usuario?.nombre || null;

  return (
    <View
      style={[
        styles.messageContainer,
        isOwn ? styles.messageContainerOwn : styles.messageContainerOther,
      ]}
    >
      {/* Avatar (solo para mensajes de otros) */}
      {!isOwn && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(userName)}</Text>
        </View>
      )}

      {/* Burbuja de mensaje */}
      <TouchableOpacity
        onLongPress={onLongPress}
        activeOpacity={0.8}
        style={[
          styles.messageBubble,
          isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther,
        ]}
      >
        {!isOwn && userName && (
          <Text style={styles.senderName}>{userName}</Text>
        )}
        <Text style={styles.messageText}>{message.contenido}</Text>
        <View style={styles.messageMeta}>
          {message.censurado && (
            <Text style={styles.censoredLabel}>censurado</Text>
          )}
          <Text style={styles.messageTime}>
            {formatTime(message.created_at)}
          </Text>
          {showError && (
            <Ionicons
              name="alert-circle"
              size={12}
              color={COLORS.error}
              style={styles.errorIcon}
            />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default MessageBubble;
