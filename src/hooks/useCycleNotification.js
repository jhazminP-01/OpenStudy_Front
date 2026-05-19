import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOUND_ENABLED_KEY = '@openstudy:sound_enabled';

export const useCycleNotification = () => {
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [completedPhase, setCompletedPhase] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cycleHistory, setCycleHistory] = useState([]);
  const soundRef = useRef(null);

  // Cargar preferencia de sonido al iniciar
  useEffect(() => {
    const loadSoundPref = async () => {
      try {
        const stored = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
        if (stored !== null) {
          setSoundEnabled(JSON.parse(stored));
        }
      } catch (_) {}
    };
    loadSoundPref();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const toggleSound = useCallback(async () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    try {
      await AsyncStorage.setItem(SOUND_ENABLED_KEY, JSON.stringify(newValue));
    } catch (_) {}
  }, [soundEnabled]);

  const playSound = useCallback(async (phase) => {
    if (!soundEnabled) return;
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
      });
      // estudio terminó → start.mp3 | descanso terminó → end.wav
      const source = phase === 'estudio'
        ? require('../../assets/sounds/start.mp3')
        : require('../../assets/sounds/end.wav');
      const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: true });
      soundRef.current = sound;
    } catch (e) {
      // Web Audio API como fallback en web
      if (Platform.OS === 'web') {
        try {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (!AudioCtx) return;
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = phase === 'estudio' ? 880 : 520;
          gain.gain.setValueAtTime(0.4, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.4);
        } catch (_) {}
      }
    }
  }, [soundEnabled]);

  const showNotification = useCallback((phase) => {
    setCompletedPhase(phase);
    setNotificationVisible(true);
    playSound(phase);
    const now = new Date();
    const time = now.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    setCycleHistory((prev) => [{ phase, time, id: Date.now() }, ...prev].slice(0, 10));
  }, [playSound]);

  const dismissNotification = useCallback(() => {
    setNotificationVisible(false);
  }, []);

  return {
    notificationVisible,
    completedPhase,
    soundEnabled,
    cycleHistory,
    toggleSound,
    showNotification,
    dismissNotification,
  };
};

export default useCycleNotification;
