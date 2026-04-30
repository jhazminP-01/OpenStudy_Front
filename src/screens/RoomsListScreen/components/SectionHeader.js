import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../styles';
import styles from '../RoomsListScreen.styles';

const SectionHeader = ({ icon = 'people', title = 'Salas disponibles', count }) => {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionLeft}>
        <View style={styles.sectionIconContainer}>
          <Ionicons name={icon} size={18} color={COLORS.textRoomsTertiary} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      <Text style={styles.sectionCount}>
        {count} salas activas
      </Text>
    </View>
  );
};

export default SectionHeader;
