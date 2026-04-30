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

  const getInitials = (userId) => {
    if (!userId) return '?';
    return userId.charAt(0).toUpperCase();
  };

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
          <Text style={styles.avatarText}>{getInitials(message.usuario_id)}</Text>
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
