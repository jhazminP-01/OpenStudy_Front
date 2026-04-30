import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import RoomsListScreen from '../screens/RoomsListScreen';
import RoomCreatedScreen from '../screens/RoomCreatedScreen';
import RoomScreen from '../screens/room/RoomScreen';
import RoomDetailsScreen from '../screens/room/RoomDetailsScreen';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../styles';
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
    <Stack.Screen 
      name="Room" 
      component={RoomScreen}
    />
    <Stack.Screen 
      name="RoomDetails" 
      component={RoomDetailsScreen}
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

        tabBarActiveTintColor: COLORS.textRoomsSecondaryButton,
        tabBarInactiveTintColor: COLORS.textRoomsTertiary,
        headerShown: false,

        tabBarStyle: styles.tabBar,

        tabBarLabelStyle: styles.tabBarLabel,

        tabBarItemStyle: styles.tabBarItem,

        tabBarBackground: () => (
          <View style={styles.tabBarBackground} />
        ),
      })}
    >
      <Tab.Screen
        name="Rooms"
        component={RoomsStack}
        options={({ route }) => ({
          title: 'Salas',
          tabBarStyle: ((route) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? 'RoomsList';
            if (routeName === 'Room') {
              return { display: 'none' };
            }
            return styles.tabBar;
          })(route),
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    bottom: SPACING.md,
    height: 70,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderRoomsMedium,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: SPACING.borderRadius['2xl'],
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    elevation: 0,
  },
  tabBarLabel: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    fontWeight: TYPOGRAPHY.caption.fontWeight,
    marginTop: 2,
  },
  tabBarItem: {
    borderRadius: 18,
    marginHorizontal: 6,
  },
  tabBarBackground: {
    flex: 1,
    borderRadius: SPACING.borderRadius['2xl'],
    backgroundColor: COLORS.backgroundDark,
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
    shadowColor: COLORS.shadowRooms,
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
  },
});