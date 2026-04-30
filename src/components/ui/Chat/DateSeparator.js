import React from 'react';
import { View, Text } from 'react-native';
import { messagesService } from '../../../services/messages';
import styles from './Chat.styles';

const DateSeparator = ({ date }) => {
  const separatorText = messagesService.getDateSeparator(date);

  return (
    <View style={styles.dateSeparator}>
      <View style={styles.dateSeparatorLine} />
      <Text style={styles.dateSeparatorText}>{separatorText}</Text>
      <View style={styles.dateSeparatorLine} />
    </View>
  );
};

export default DateSeparator;
