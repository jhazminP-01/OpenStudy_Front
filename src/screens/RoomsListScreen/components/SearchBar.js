import React from 'react';
import { TextInput } from 'react-native';
import { COLORS } from '../../../styles';
import styles from '../RoomsListScreen.styles';

const SearchBar = ({ value, onChangeText, placeholder = 'Buscar salas de estudio...' }) => {
  return (
    <TextInput
      style={styles.searchInput}
      placeholder={placeholder}
      placeholderTextColor={COLORS.placeholderTextColor}
      value={value}
      onChangeText={onChangeText}
    />
  );
};

export default SearchBar;
