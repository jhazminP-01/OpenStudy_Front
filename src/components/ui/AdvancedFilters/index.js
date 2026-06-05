import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../styles';

const AdvancedFilters = ({
  visible,
  onToggle,
  onApply,
  onClear,
  filters = {
    fase: [],
    capacidad: [],
    ordenar: 'default',
  },
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const toggleFilter = (category, value) => {
    setLocalFilters(prev => {
      const current = prev[category] || [];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const setOrdenamiento = (value) => {
    setLocalFilters(prev => ({ ...prev, ordenar: value }));
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleClear = () => {
    setLocalFilters({
      fase: [],
      capacidad: [],
      ordenar: 'default',
    });
    onClear();
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Filtros Avanzados</Text>
        <TouchableOpacity onPress={onToggle}>
          <Ionicons name="close" size={24} color={COLORS.textWhite} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filtro por Fase del Timer */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Fase del Timer</Text>
          <FilterCheckbox
            label="Enfoque"
            value="estudio"
            checked={localFilters.fase?.includes('estudio')}
            onToggle={() => toggleFilter('fase', 'estudio')}
          />
          <FilterCheckbox
            label="Descanso"
            value="descanso"
            checked={localFilters.fase?.includes('descanso')}
            onToggle={() => toggleFilter('fase', 'descanso')}
          />
          <FilterCheckbox
            label="Descanso Largo"
            value="descanso_largo"
            checked={localFilters.fase?.includes('descanso_largo')}
            onToggle={() => toggleFilter('fase', 'descanso_largo')}
          />
        </View>

        {/* Filtro por Capacidad */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Capacidad</Text>
          <FilterCheckbox
            label="Con espacio disponible"
            value="conEspacio"
            checked={localFilters.capacidad?.includes('conEspacio')}
            onToggle={() => toggleFilter('capacidad', 'conEspacio')}
          />
          <FilterCheckbox
            label="Salas llenas"
            value="llenas"
            checked={localFilters.capacidad?.includes('llenas')}
            onToggle={() => toggleFilter('capacidad', 'llenas')}
          />
        </View>

        {/* Ordenamiento */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Ordenar por</Text>
          <FilterRadio
            label="Por defecto"
            value="default"
            selected={localFilters.ordenar === 'default'}
            onSelect={() => setOrdenamiento('default')}
          />
          <FilterRadio
            label="Más participantes"
            value="participantes"
            selected={localFilters.ordenar === 'participantes'}
            onSelect={() => setOrdenamiento('participantes')}
          />
          <FilterRadio
            label="Menos participantes"
            value="menosParticipantes"
            selected={localFilters.ordenar === 'menosParticipantes'}
            onSelect={() => setOrdenamiento('menosParticipantes')}
          />
          <FilterRadio
            label="Más recientes"
            value="recientes"
            selected={localFilters.ordenar === 'recientes'}
            onSelect={() => setOrdenamiento('recientes')}
          />
        </View>
      </ScrollView>

      {/* Botones de acción */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Text style={styles.clearButtonText}>Limpiar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>Aplicar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const FilterCheckbox = ({ label, checked, onToggle }) => (
  <TouchableOpacity style={styles.filterItem} onPress={onToggle}>
    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked && (
        <Ionicons name="checkmark" size={16} color={COLORS.textWhite} />
      )}
    </View>
    <Text style={styles.filterLabel}>{label}</Text>
  </TouchableOpacity>
);

const FilterRadio = ({ label, selected, onSelect }) => (
  <TouchableOpacity style={styles.filterItem} onPress={onSelect}>
    <View style={[styles.radio, selected && styles.radioSelected]}>
      {selected && <View style={styles.radioDot} />}
    </View>
    <Text style={styles.filterLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.backgroundRoomsMedium,
    borderRadius: SPACING.borderRadius.lg,
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
    overflow: 'hidden',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderRoomsLight,
  },

  title: {
    ...TYPOGRAPHY.rooms.sectionTitle,
    color: COLORS.textWhite,
  },

  content: {
    maxHeight: 300,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },

  filterSection: {
    marginBottom: SPACING.md,
  },

  sectionTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textRoomsAccent,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    fontSize: 12,
  },

  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.xs,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.borderRoomsLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },

  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.borderRoomsLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },

  radioSelected: {
    borderColor: COLORS.primary,
  },

  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  filterLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textWhite,
    fontSize: 13,
  },

  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderRoomsLight,
  },

  clearButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.borderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
    alignItems: 'center',
  },

  clearButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textRoomsSecondary,
    fontWeight: '600',
    fontSize: 12,
  },

  applyButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.borderRadius.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },

  applyButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textWhite,
    fontWeight: '600',
    fontSize: 12,
  },
});

export default AdvancedFilters;
