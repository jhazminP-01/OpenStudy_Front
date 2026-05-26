import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';

import { AppNavigator } from './src/navigation/AppNavigator';
import OfflineBanner from './src/components/common/OfflineBanner';

export default function App() {
  return (
    <NavigationContainer>
      <View style={styles.container}>
        <AppNavigator />
        <OfflineBanner />
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
