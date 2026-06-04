import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../styles';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import TermsAndConditionsScreen from '../screens/auth/TermsAndConditionsScreen';
import BannedScreen from '../screens/auth/BannedScreen';

const Stack = createNativeStackNavigator();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: true,
          title: 'Iniciar Sesión',
          headerStyle: {
            backgroundColor: COLORS.gradientRooms[0],
          },
          headerTintColor: COLORS.textWhite,
          headerTitleStyle: {
            color: COLORS.textWhite,
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          headerShown: true,
          title: 'Registro',
          headerStyle: {
            backgroundColor: COLORS.gradientRooms[0],
          },
          headerTintColor: COLORS.textWhite,
          headerTitleStyle: {
            color: COLORS.textWhite,
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name="TermsAndConditions"
        component={TermsAndConditionsScreen}
        options={{
          headerShown: true,
          title: 'Términos y Condiciones',
          headerStyle: {
            backgroundColor: COLORS.gradientRooms[0],
          },
          headerTintColor: COLORS.textWhite,
          headerTitleStyle: {
            color: COLORS.textWhite,
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name="Banned"
        component={BannedScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
