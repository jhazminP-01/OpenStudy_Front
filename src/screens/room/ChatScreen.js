import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS } from '../../styles';
import { messagesService } from '../../services/messages';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../../lib/supabase';
import {
  MessageList,
  MessageInput,
  TypingIndicator,
} from '../../components/ui/Chat';
import ReportMessageModal from '../../components/moderation/ReportMessageModal';
import { reportsService } from '../../services/reports';

const ChatScreen = ({ route }) => {
  const { roomId } = route.params;
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [contentWarning, setContentWarning] = useState(false);
  const subscriptionRef = useRef(null);

  // Cargar mensajes iniciales
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await messagesService.getMessages(roomId, 50);

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  // Configurar suscripción realtime
  const setupRealtimeSubscription = useCallback(() => {
    subscriptionRef.current = messagesService.subscribeToMessages(
      roomId,
      (payload) => {
        handleRealtimeUpdate(payload);
      }
    );
  }, [roomId]);

  // Manejar actualizaciones en tiempo real
  const handleRealtimeUpdate = async (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case 'INSERT': {
        // Obtener nombre del usuario del nuevo mensaje
        const { data: userData } = await supabase
          .from('usuario')
          .select('id, nombre_completo')
          .eq('id', newRecord.usuario_id)
          .single();
        const msgWithUser = {
          ...newRecord,
          usuario: { nombre: userData?.nombre_completo || null },
        };
        setMessages((prev) => {
          const exists = prev.some((msg) => msg.id === newRecord.id);
          if (exists) return prev;
          return [...prev, msgWithUser];
        });
        break;
      }

      case 'UPDATE':
        // Actualizar mensaje existente
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newRecord.id ? { ...msg, ...newRecord } : msg
          )
        );
        break;

      case 'DELETE':
        // Marcar mensaje como censurado
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === oldRecord.id ? { ...msg, censurado: true } : msg
          )
        );
        break;
    }
  };

  // Enviar mensaje
  const handleSendMessage = async (content) => {
    if (!user?.id) return;

    // HU-14: Validar y censurar contenido inapropiado
    const validation = messagesService.validateMessage(content);
    if (!validation.valid) throw new Error(validation.error);

    const finalContent = validation.censoredContent;
    const wasCensored = validation.censored;

    // Advertir al usuario si su mensaje fue censurado
    if (wasCensored) {
      setContentWarning(true);
      setTimeout(() => setContentWarning(false), 4000);
    }

    // Optimistic update: agregar mensaje inmediatamente
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      sala_id: roomId,
      usuario_id: user.id,
      contenido: finalContent,
      created_at: new Date().toISOString(),
      censurado: false,
      pending: true,
      usuario: { nombre: null },
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    // Enviar al servidor con contenido censurado
    const { data, error } = await messagesService.sendMessage(
      roomId,
      user.id,
      finalContent
    );

    // Reporte automático si hubo censura (HU-14)
    if (!error && wasCensored) {
      reportsService.createReport(roomId, user.id, {
        mensajeId: data?.id || null,
        reportadoId: user.id,
        motivo: 'Contenido inapropiado',
        descripcion: `Mensaje con contenido inapropiado detectado automáticamente. Original: "${content.substring(0, 100)}"`,
        tipo: 'mensaje',
        es_automatico: true,
      });
    }

    if (error) {
      // Marcar como error si falló
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticMessage.id
            ? { ...msg, error: true, pending: false }
            : msg
        )
      );
      throw error;
    } else {
      // Reemplazar mensaje temporal con el real
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticMessage.id ? { ...data, pending: false } : msg
        )
      );
    }
  };

  // Simular indicador de "escribiendo..." (placeholder para HU-13)
  const simulateTyping = () => {
    // Esto se conectará con el estado del Pomodoro en HU-13
    setTypingUsers(['Usuario']);
    setTimeout(() => setTypingUsers([]), 3000);
  };

  useEffect(() => {
    loadMessages();
    setupRealtimeSubscription();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [loadMessages, setupRealtimeSubscription]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.container}>
        {/* Aviso de contenido censurado (HU-14) */}
        {contentWarning && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              ⚠️ Tu mensaje contenía palabras inapropiadas y fueron censuradas.
            </Text>
          </View>
        )}

        {/* Indicador de escribiendo */}
        <TypingIndicator users={typingUsers} />

        {/* Lista de mensajes */}
        <MessageList
          messages={messages}
          currentUserId={user?.id}
          loading={loading}
          onLongPressMessage={(message) => {
            if (message.usuario_id !== user?.id) {
              setSelectedMessage(message);
              setReportModalVisible(true);
            }
          }}
        />

        {/* Input de mensaje */}
        <MessageInput onSend={handleSendMessage} />

        <ReportMessageModal
          visible={reportModalVisible}
          onClose={() => { setReportModalVisible(false); setSelectedMessage(null); }}
          message={selectedMessage}
          salaId={roomId}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  warningBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 6,
  },
  warningText: {
    color: '#fca5a5',
    fontSize: 12,
    lineHeight: 18,
  },
});

export default ChatScreen;
