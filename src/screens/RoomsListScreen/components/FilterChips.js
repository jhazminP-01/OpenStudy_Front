import React from 'react';
import { FlatList, TouchableOpacity, Text } from 'react-native';
import styles from '../RoomsListScreen.styles';

const FilterChips = ({ materias, selectedMateria, onSelectMateria }) => {
  const data = [{ id: 'all', nombre: 'Todas' }, ...materias];

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.id)}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filtersContainer}
      renderItem={({ item }) => {
        const isSelected =
          item.id === 'all'
            ? selectedMateria === null
            : selectedMateria === item.id;

        return (
          <TouchableOpacity
            style={[
              styles.filterChip,
              isSelected && styles.filterChipSelected,
            ]}
            onPress={() => onSelectMateria(item.id === 'all' ? null : item.id)}
          >
            <Text
              style={[
                styles.filterChipText,
                isSelected && styles.filterChipTextSelected,
              ]}
            >
              {item.nombre}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
};

export default FilterChips;
