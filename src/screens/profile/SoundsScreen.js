import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles';
import { useAuth } from '../../hooks/useAuth';
import { profileService } from '../../services/profile';
import InAppNotification from '../../components/ui/InAppNotification';
import { ambientSoundControl } from '../../utils/ambientSoundControl';

const ALL_SOUNDS = [
  { id: 'lluvia_suave', nombre: 'Lluvia suave' },
  { id: 'bosque_tranquilo', nombre: 'Bosque tranquilo' },
  { id: 'piano_ligero', nombre: 'Piano ligero' },
  { id: 'ambiente_cafe', nombre: 'Ambiente café' },
  { id: 'campana_suave', nombre: 'Campana suave' },
  { id: 'olas_del_mar', nombre: 'Olas del mar' },
  { id: 'viento_suave', nombre: 'Viento suave' },
  { id: 'rio_sereno', nombre: 'Río sereno' },
  { id: 'fuego', nombre: 'Fuego' },
];

const getSoundFile = (id) => {
  const soundMap = {
    'lluvia_suave': require('../../../assets/sounds/lluvia_suave.mp3'),
    'bosque_tranquilo': require('../../../assets/sounds/bosque_tranquilo.mp3'),
    'piano_ligero': require('../../../assets/sounds/piano_ligero.mp3'),
    'ambiente_cafe': require('../../../assets/sounds/ambiente_cafe.mp3'),
    'campana_suave': require('../../../assets/sounds/campana_suave.mp3'),
    'olas_del_mar': require('../../../assets/sounds/olas_del_mar.mp3'),
    'viento_suave': require('../../../assets/sounds/viento_suave.mp3'),
    'rio_sereno': require('../../../assets/sounds/rio_sereno.mp3'),
    'fuego': require('../../../assets/sounds/fuego.mp3'),
  };
  return soundMap[id];
};

const SoundsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [focusEnabled, setFocusEnabled] = useState(true);
  const [breakEnabled, setBreakEnabled] = useState(true);
  const [focusSound, setFocusSound] = useState('lluvia_suave');
  const [breakSound, setBreakSound] = useState('olas_del_mar');
  const [playingId, setPlayingId] = useState(null);
  const [notification, setNotification] = useState({ visible: false, title: '', message: '', variant: 'success' });
  const soundRef = useRef(null);
  const timeoutRef = useRef(null);

  const loadConfig = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data } = await profileService.getConfig(user.id);
    if (data) {
      setFocusSound(data.sonido_enfoque || 'lluvia_suave');
      setBreakSound(data.sonido_descanso || 'olas_del_mar');
      setFocusEnabled(data.sonidos_timer !== false);
      setBreakEnabled(data.sonidos_timer !== false);
    }
    setLoading(false);
  }, [user?.id]);

  const savedRef = useRef(false);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Pausar al entrar, reanudar al salir (solo una vez al montar/desmontar)
  useEffect(() => {
    ambientSoundControl.pause();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (!savedRef.current) {
        ambientSoundControl.resume();
      }
    };
  }, []);

  const playPreview = async (soundId) => {
    try {
      // Detener sonido actual si hay uno
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Si estaba reproduciendo el mismo, solo detener
      if (playingId === soundId) {
        setPlayingId(null);
        return;
      }

      // Reproducir nuevo sonido
      const { sound } = await Audio.Sound.createAsync(getSoundFile(soundId));
      soundRef.current = sound;
      setPlayingId(soundId);
      await sound.playAsync();

      // Detener después de 10 segundos
      timeoutRef.current = setTimeout(async () => {
        if (soundRef.current) {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
        setPlayingId(null);
      }, 10000);

      // Listener para cuando termina naturalmente
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingId(null);
        }
      });
    } catch (error) {
      console.error('Error playing sound:', error);
      setPlayingId(null);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    const { data, error } = await profileService.updateConfig(user.id, {
      sonido_enfoque: focusSound,
      sonido_descanso: breakSound,
      sonidos_timer: focusEnabled || breakEnabled,
    });
    setSaving(false);

    if (!error) {
      savedRef.current = true;
      setNotification({
        visible: true,
        title: 'Cambios guardados',
        message: 'La configuración de sonidos se ha actualizado correctamente.',
        variant: 'success',
      });
      setTimeout(() => {
        // Al volver, reanudar con la nueva configuración
        ambientSoundControl.resume();
        navigation.goBack();
      }, 1500);
    } else {
      console.error('Error guardando config:', error);
      setNotification({
        visible: true,
        title: 'Error',
        message: `No se pudieron guardar los cambios: ${error.message || error}`,
        variant: 'error',
      });
    }
  };

  const getSelectedName = (sounds, id) => {
    const sound = sounds.find((s) => s.id === id);
    return sound ? sound.nombre : id;
  };

  if (loading) {
    return (
      <LinearGradient colors={COLORS.gradientRooms} style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </LinearGradient>
    );
  }

  const renderSoundItem = (sound, selectedId, onSelect, enabled) => (
    <TouchableOpacity
      key={sound.id}
      style={[styles.soundItem, !enabled && styles.soundItemDisabled]}
      onPress={() => enabled && onSelect(sound.id)}
      activeOpacity={enabled ? 0.7 : 1}
    >
      <TouchableOpacity
        style={[styles.playButton, playingId === sound.id && styles.playButtonActive]}
        onPress={() => playPreview(sound.id)}
      >
        <Ionicons
          name={playingId === sound.id ? 'pause' : 'play'}
          size={14}
          color={playingId === sound.id ? COLORS.primary : COLORS.textWhite}
        />
      </TouchableOpacity>
      <Text style={[styles.soundName, !enabled && styles.soundNameDisabled]}>
        {sound.nombre}
      </Text>
      <View style={[styles.radioButton, selectedId === sound.id && styles.radioButtonSelected]}>
        {selectedId === sound.id && <View style={styles.radioButtonInner} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={COLORS.gradientRooms} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Sonidos del temporizador</Text>
            <Text style={styles.headerSubtitle}>Personaliza los sonidos de enfoque y descanso</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Sonido de enfoque */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconCircle}>
              <Ionicons name="bulb-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Sonido de enfoque</Text>
              <Text style={styles.sectionSelected}>{getSelectedName(ALL_SOUNDS, focusSound)}</Text>
            </View>
            <Switch
              value={focusEnabled}
              onValueChange={setFocusEnabled}
              trackColor={{ false: COLORS.borderRoomsMedium, true: COLORS.primary }}
              thumbColor={COLORS.textWhite}
            />
          </View>

          <View style={styles.soundsList}>
            {ALL_SOUNDS.map((sound) =>
              renderSoundItem(sound, focusSound, setFocusSound, focusEnabled)
            )}
          </View>
        </View>

        {/* Sonido de descanso */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconCircle}>
              <Ionicons name="moon-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Sonido de descanso</Text>
              <Text style={styles.sectionSelected}>{getSelectedName(ALL_SOUNDS, breakSound)}</Text>
            </View>
            <Switch
              value={breakEnabled}
              onValueChange={setBreakEnabled}
              trackColor={{ false: COLORS.borderRoomsMedium, true: COLORS.primary }}
              thumbColor={COLORS.textWhite}
            />
          </View>

          <View style={styles.soundsList}>
            {ALL_SOUNDS.map((sound) =>
              renderSoundItem(sound, breakSound, setBreakSound, breakEnabled)
            )}
          </View>
        </View>

        {/* Nota */}
        <View style={styles.noteContainer}>
          <Ionicons name="headset-outline" size={18} color={COLORS.textRoomsTertiary} />
          <Text style={styles.noteText}>
            Puedes escuchar una vista previa antes de elegir.
          </Text>
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color={COLORS.textWhite} size="small" />
          ) : (
            <>
              <Ionicons name="save-outline" size={18} color={COLORS.textWhite} />
              <Text style={styles.saveButtonText}>Guardar cambios</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomPad} />
      </ScrollView>

      <InAppNotification
        visible={notification.visible}
        variant={notification.variant}
        title={notification.title}
        message={notification.message}
        onDismiss={() => setNotification({ ...notification, visible: false })}
        duration={3000}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: 56,
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  backButton: {
    padding: SPACING.xs,
    width: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textWhite,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textRoomsTertiary,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  sectionCard: {
    backgroundColor: COLORS.backgroundRoomsLight,
    borderRadius: SPACING.borderRadius.lg,
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundRoomsMedium,
  },
  sectionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.successIconBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textWhite,
  },
  sectionSelected: {
    fontSize: 12,
    color: COLORS.primaryLight,
    marginTop: 1,
  },
  soundsList: {
    paddingVertical: SPACING.sm,
  },
  soundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  soundItemDisabled: {
    opacity: 0.4,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.borderRoomsMedium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  playButtonActive: {
    backgroundColor: COLORS.successIconBg,
  },
  soundName: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textWhite,
    fontWeight: '500',
  },
  soundNameDisabled: {
    color: COLORS.textRoomsTertiary,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.textRoomsTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: COLORS.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginVertical: SPACING.md,
  },
  noteText: {
    fontSize: 12,
    color: COLORS.textRoomsTertiary,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: SPACING.borderRadius.lg,
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textWhite,
  },
  bottomPad: {
    height: 90,
  },
});

export default SoundsScreen;
