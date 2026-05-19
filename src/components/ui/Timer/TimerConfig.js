import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../styles';

const TimerConfig = ({
  visible, onClose, onSave,
  currentEstudio = 25,
  currentDescanso = 5,
  currentDescansoLargo = 30,
  currentCiclosAntesLargo = 4,
}) => {
  const [estudio, setEstudio] = useState(String(currentEstudio));
  const [descanso, setDescanso] = useState(String(currentDescanso));
  const [descansoLargo, setDescansoLargo] = useState(String(currentDescansoLargo));
  const [ciclosAntesLargo, setCiclosAntesLargo] = useState(String(currentCiclosAntesLargo));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setEstudio(String(currentEstudio));
      setDescanso(String(currentDescanso));
      setDescansoLargo(String(currentDescansoLargo));
      setCiclosAntesLargo(String(currentCiclosAntesLargo));
    }
  }, [visible, currentEstudio, currentDescanso, currentDescansoLargo, currentCiclosAntesLargo]);

  const adjust = (setter, current, delta, min, max) => {
    const val = parseInt(current) || min;
    setter(String(Math.min(max, Math.max(min, val + delta))));
  };

  const handleSave = async () => {
    const e = parseInt(estudio);
    const d = parseInt(descanso);
    const dl = parseInt(descansoLargo);
    const cl = parseInt(ciclosAntesLargo);
    if (isNaN(e) || e < 5 || e > 60) {
      Alert.alert('Error', 'Estudio: entre 5 y 60 minutos');
      return;
    }
    if (isNaN(d) || d < 1 || d > 60) {
      Alert.alert('Error', 'Descanso: entre 1 y 60 minutos');
      return;
    }
    if (isNaN(dl) || dl < 5 || dl > 60) {
      Alert.alert('Error', 'Descanso largo: entre 5 y 60 minutos');
      return;
    }
    if (isNaN(cl) || cl < 1 || cl > 8) {
      Alert.alert('Error', 'Ciclos antes del descanso largo: entre 1 y 8');
      return;
    }
    try {
      setSaving(true);
      await onSave({ estudio: e, descanso: d, descansoLargo: dl, ciclosAntesLargo: cl });
      onClose();
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Ionicons name="settings-outline" size={20} color={COLORS.primary} />
            <Text style={styles.title}>Configurar Pomodoro</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={20} color={COLORS.textRoomsSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.infoBadge}>
            <Ionicons name="information-circle-outline" size={14} color={COLORS.textRoomsSecondary} />
            <Text style={styles.infoText}>Se aplica al siguiente ciclo</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Estudio</Text>
            <View style={styles.inputRow}>
              <TouchableOpacity
                style={styles.stepper}
                onPress={() => adjust(setEstudio, estudio, -5, 5, 60)}
              >
                <Ionicons name="remove" size={18} color={COLORS.primary} />
              </TouchableOpacity>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={estudio}
                  onChangeText={setEstudio}
                  keyboardType="numeric"
                  maxLength={2}
                  textAlign="center"
                />
                <Text style={styles.unit}>min</Text>
              </View>
              <TouchableOpacity
                style={styles.stepper}
                onPress={() => adjust(setEstudio, estudio, +5, 5, 60)}
              >
                <Ionicons name="add" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Descanso corto</Text>
            <View style={styles.inputRow}>
              <TouchableOpacity
                style={[styles.stepper, styles.stepperBreak]}
                onPress={() => adjust(setDescanso, descanso, -1, 1, 60)}
              >
                <Ionicons name="remove" size={18} color={COLORS.secondary} />
              </TouchableOpacity>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, styles.inputBreak]}
                  value={descanso}
                  onChangeText={setDescanso}
                  keyboardType="numeric"
                  maxLength={2}
                  textAlign="center"
                />
                <Text style={styles.unit}>min</Text>
              </View>
              <TouchableOpacity
                style={[styles.stepper, styles.stepperBreak]}
                onPress={() => adjust(setDescanso, descanso, +1, 1, 60)}
              >
                <Ionicons name="add" size={18} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Descanso largo</Text>
            <View style={styles.inputRow}>
              <TouchableOpacity
                style={[styles.stepper, styles.stepperLong]}
                onPress={() => adjust(setDescansoLargo, descansoLargo, -5, 5, 60)}
              >
                <Ionicons name="remove" size={18} color={COLORS.info} />
              </TouchableOpacity>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, styles.inputLong]}
                  value={descansoLargo}
                  onChangeText={setDescansoLargo}
                  keyboardType="numeric"
                  maxLength={2}
                  textAlign="center"
                />
                <Text style={styles.unit}>min</Text>
              </View>
              <TouchableOpacity
                style={[styles.stepper, styles.stepperLong]}
                onPress={() => adjust(setDescansoLargo, descansoLargo, +5, 5, 60)}
              >
                <Ionicons name="add" size={18} color={COLORS.info} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Ciclos antes del descanso largo</Text>
            <View style={styles.inputRow}>
              <TouchableOpacity
                style={[styles.stepper, styles.stepperCycles]}
                onPress={() => adjust(setCiclosAntesLargo, ciclosAntesLargo, -1, 1, 8)}
              >
                <Ionicons name="remove" size={18} color={COLORS.warning} />
              </TouchableOpacity>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, styles.inputCycles]}
                  value={ciclosAntesLargo}
                  onChangeText={setCiclosAntesLargo}
                  keyboardType="numeric"
                  maxLength={1}
                  textAlign="center"
                />
                <Text style={styles.unit}>ciclos</Text>
              </View>
              <TouchableOpacity
                style={[styles.stepper, styles.stepperCycles]}
                onPress={() => adjust(setCiclosAntesLargo, ciclosAntesLargo, +1, 1, 8)}
              >
                <Ionicons name="add" size={18} color={COLORS.warning} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator color={COLORS.textWhite} size="small" />
              ) : (
                <Text style={styles.saveText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.cardRoomsBackground,
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textRoomsSecondary,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textRoomsSecondary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  stepper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBreak: {
    borderColor: COLORS.secondary,
  },
  stepperLong: {
    borderColor: COLORS.info || '#3B82F6',
  },
  stepperCycles: {
    borderColor: COLORS.warning,
  },
  inputLong: {
    borderColor: COLORS.info || '#3B82F6',
  },
  inputCycles: {
    borderColor: COLORS.warning,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  input: {
    width: 56,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    color: COLORS.textWhite,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  inputBreak: {
    borderColor: COLORS.secondary,
  },
  unit: {
    fontSize: 12,
    color: COLORS.textRoomsTertiary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: COLORS.textRoomsSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: COLORS.textWhite,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default TimerConfig;
