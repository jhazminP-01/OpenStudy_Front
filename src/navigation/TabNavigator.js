import React from 'react';
import { Text } from 'react-native';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoomsListScreen from '../screens/RoomsListScreen';
import RoomCreatedScreen from '../screens/RoomCreatedScreen';
import { Ionicons } from '@expo/vector-icons';
// Screens
import HomeScreen from '../screens/profile/HomeScreen';
import CreateRoomScreen from '../screens/CreateRoomScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack para Rooms
const RoomsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen 
      name="RoomsList" 
      component={RoomsListScreen}
    />
    <Stack.Screen 
      name="CreateRoom" 
      component={CreateRoomScreen}
    />
    <Stack.Screen 
      name="RoomCreated" 
      component={RoomCreatedScreen}
    />
  </Stack.Navigator>
);

// Stack para Profile
const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
  </Stack.Navigator>
);

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, focused }) => {
          let iconName;

          if (route.name === 'Rooms') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },

        tabBarActiveTintColor: '#D7A8FF',
        tabBarInactiveTintColor: '#B8A9D6',
        headerShown: false,

        tabBarStyle: {
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 12,
          height: 70,
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.10)',
          backgroundColor: '#160A38',
          borderRadius: 24,
          paddingTop: 8,
          paddingBottom: 8,
          elevation: 0,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },

        tabBarItemStyle: {
          borderRadius: 18,
          marginHorizontal: 6,
        },

        tabBarBackground: () => (
          <View
            style={{
              flex: 1,
              borderRadius: 24,
              backgroundColor: '#160A38',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
              shadowColor: '#C084FC',
              shadowOpacity: 0.12,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 4 },
            }}
          />
        ),
      })}
    >
      <Tab.Screen
        name="Rooms"
        component={RoomsStack}
        options={{ title: 'Salas' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};