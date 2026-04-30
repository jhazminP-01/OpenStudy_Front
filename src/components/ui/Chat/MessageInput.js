import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../styles';
import { messagesService } from '../../../services/messages';
import styles from './Chat.styles';

const MessageInput = ({ onSend, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = async () => {
    // Validar mensaje
    const validation = messagesService.validateMessage(message);
    if (!validation.valid) {
      setError(validation.error);
      setTimeout(() => setError(null), 3000);
      return;
    }

    const contentToSend = message.trim();
    setMessage('');
    setSending(true);

    try {
      await onSend(contentToSend);
    } catch (err) {
      // Restaurar mensaje si falló
      setMessage(contentToSend);
    } finally {
      setSending(false);
    }
  };

  const isEmpty = message.trim().length === 0;

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="Escribe un mensaje..."
        placeholderTextColor={COLORS.textRoomsTertiary}
        value={message}
        onChangeText={setMessage}
        multiline
        maxLength={500}
        editable={!disabled && !sending}
        returnKeyType="send"
        blurOnSubmit={false}
        onSubmitEditing={!isEmpty ? handleSend : null}
      />

      <TouchableOpacity
        style={[
          styles.sendButton,
          (isEmpty || disabled || sending) && styles.sendButtonDisabled,
        ]}
        onPress={handleSend}
        disabled={isEmpty || disabled || sending}
      >
        {sending ? (
          <ActivityIndicator color={COLORS.textWhite} size="small" />
        ) : (
          <Ionicons name="send" size={18} color={COLORS.textWhite} />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default MessageInput;
