import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function RoomsListScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Salas de Estudio</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('CreateRoom')}
      >
        <Text style={styles.buttonText}>+ Crear Sala</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#14051F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#8B5CF6',
    padding: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});