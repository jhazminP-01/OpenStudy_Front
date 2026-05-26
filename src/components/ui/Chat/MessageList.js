import React, { useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { COLORS } from '../../../styles';
import MessageBubble from './MessageBubble';
import DateSeparator from './DateSeparator';
import styles from './Chat.styles';

const MessageList = ({
  messages,
  currentUserId,
  loading = false,
  onLoadMore,
  hasMore = false,
  onLongPressMessage,
}) => {
  const flatListRef = useRef(null);

  // Agrupar mensajes por fecha
  const groupMessagesByDate = (msgs) => {
    const groups = [];
    let currentDate = null;

    msgs.forEach((msg) => {
      const msgDate = new Date(msg.created_at).toDateString();

      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ type: 'separator', date: msg.created_at });
      }

      groups.push({ type: 'message', data: msg });
    });

    return groups;
  };

  const groupedMessages = groupMessagesByDate(messages);

  const renderItem = ({ item }) => {
    if (item.type === 'separator') {
      return <DateSeparator date={item.date} />;
    }

    const message = item.data;
    const isOwn = message.usuario_id === currentUserId;

    return (
      <MessageBubble
        message={message}
        isOwn={isOwn}
        user={message.usuario}
        onLongPress={!isOwn && onLongPressMessage ? () => onLongPressMessage(message) : undefined}
      />
    );
  };

  const keyExtractor = (item, index) => {
    if (item.type === 'separator') {
      return `separator-${index}`;
    }
    return item.data.id?.toString() || `msg-${index}`;
  };

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  // Scroll al final cuando llegan mensajes nuevos
  React.useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  if (loading && messages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator color={COLORS.textWhite} size="large" />
      </View>
    );
  }

  if (messages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No hay mensajes aún. ¡Sé el primero en escribir!
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      style={styles.messageList}
      contentContainerStyle={styles.messageListContent}
      data={groupedMessages}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReached={hasMore ? onLoadMore : null}
      onEndReachedThreshold={0.5}
      inverted={false}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    />
  );
};

export default MessageList;
