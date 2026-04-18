import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoomsListScreen from '../screens/RoomsListScreen';
import RoomCreatedScreen from '../screens/RoomCreatedScreen';

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
        tabBarIcon: ({ color }) => {
          let iconName;

          if (route.name === 'Rooms') {
            iconName = 'Salas';
          } else if (route.name === 'Profile') {
            iconName = 'Perfil';
          }

          return <Text style={{ color, fontSize: 12 }}>{iconName}</Text>;
        },
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
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