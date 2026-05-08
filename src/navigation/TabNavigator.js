import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

        tabBarActiveTintColor: COLORS.textWhite,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
        headerShown: false,

        tabBarStyle: styles.tabBar,

        tabBarLabelStyle: styles.tabBarLabel,

        tabBarItemStyle: ({ focused }) => [
          styles.tabBarItem,
          focused && styles.tabBarItemActive,
        ],

        tabBarBackground: () => (
          <LinearGradient
            colors={COLORS.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.tabBarBackground}
          />
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
    borderRadius: SPACING.borderRadius['2xl'],
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    elevation: 0,
    borderTopWidth: 0,
    backgroundColor: 'transparent',
  },
  tabBarLabel: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    fontWeight: TYPOGRAPHY.caption.fontWeight,
    marginTop: 2,
  },
  tabBarItem: {
    borderRadius: 16,
    marginHorizontal: 6,
    paddingVertical: 4,
  },
  tabBarItemActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  tabBarBackground: {
    flex: 1,
    borderRadius: SPACING.borderRadius['2xl'],
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
    boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.12)',
    style: { pointerEvents: 'none' },
  },
});