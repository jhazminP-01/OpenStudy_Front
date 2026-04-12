import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, View } from 'react-native';

import WelcomeScreen from './src/components/auth/WelcomeScreen';
import RegisterScreen from './src/components/auth/RegisterScreen';
import LoginScreen from './src/components/auth/LoginScreen';
import LoadingScreen from './src/components/common/LoadingScreen';
import HomeScreen from './src/components/main/HomeScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <View style={styles.container}>
        <Stack.Navigator 
          initialRouteName="Welcome"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#8B5CF6',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Welcome" 
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ title: 'OpenStudy' }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ 
              headerShown: true,
              title: 'Registro',
              headerStyle: {
                backgroundColor: '#8B5CF6',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen 
            name="Loading" 
            component={LoadingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ 
              headerShown: true,
              title: 'OpenStudy',
              headerStyle: {
                backgroundColor: '#8B5CF6',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
        </Stack.Navigator>
        <StatusBar style="light" />
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
