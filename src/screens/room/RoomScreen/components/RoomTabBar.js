import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../styles';
import styles from '../RoomScreen.styles';

const TABS = [
  { id: 'room', label: 'Sala', icon: 'home', iconOutline: 'home-outline' },
  { id: 'chat', label: 'Chat', icon: 'chatbubbles', iconOutline: 'chatbubbles-outline' },
  { id: 'participants', label: 'Persona', icon: 'people', iconOutline: 'people-outline' },
  { id: 'sounds', label: 'Sonidos', icon: 'musical-note', iconOutline: 'musical-note-outline' },
];

const RoomTabBar = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.tabBar}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabItem, isActive && styles.tabItemActive]}
            onPress={() => onTabChange(tab.id)}
          >
            <Ionicons
              name={isActive ? tab.icon : tab.iconOutline}
              size={22}
              color={isActive ? COLORS.textWhite : COLORS.textRoomsTertiary}
            />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default RoomTabBar;
