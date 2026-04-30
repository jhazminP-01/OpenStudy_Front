import React from 'react';
import ChatScreen from '../../ChatScreen';

const ChatTab = ({ roomId }) => {
  return <ChatScreen route={{ params: { roomId } }} />;
};

export default ChatTab;
