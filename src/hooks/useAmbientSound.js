import { useState, useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import { ambientSoundControl } from '../utils/ambientSoundControl';

const SOUND_ENABLED_KEY = '@openstudy:sound_enabled';

const getSoundFile = (id) => {
  const soundMap = {
    'lluvia_suave': require('../../assets/sounds/lluvia_suave.mp3'),
    'bosque_tranquilo': require('../../assets/sounds/bosque_tranquilo.mp3'),
    'piano_ligero': require('../../assets/sounds/piano_ligero.mp3'),
    'ambiente_cafe': require('../../assets/sounds/ambiente_cafe.mp3'),
    'campana_suave': require('../../assets/sounds/campana_suave.mp3'),
    'olas_del_mar': require('../../assets/sounds/olas_del_mar.mp3'),
    'viento_suave': require('../../assets/sounds/viento_suave.mp3'),
    'rio_sereno': require('../../assets/sounds/rio_sereno.mp3'),
    'fuego': require('../../assets/sounds/fuego.mp3'),
  };
  return soundMap[id] || soundMap['lluvia_suave'];
};

export const useAmbientSound = (userId) => {
  const [config, setConfig] = useState({
    sonido_enfoque: 'lluvia_suave',
    sonido_descanso: 'olas_del_mar',
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundRef = useRef(null);
  const currentPhaseRef = useRef(null);
  const soundEnabledRef = useRef(true);
  const configRef = useRef({ sonido_enfoque: 'lluvia_suave', sonido_descanso: 'olas_del_mar' });
  const configLoadedRef = useRef(false);
  const pendingPhaseRef = useRef(null);

  // Mantener refs sincronizados para evitar stale closures
  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);
  useEffect(() => { configRef.current = config; }, [config]);

  // Cargar configuración de sonidos
  const loadSoundConfig = useCallback(async () => {
    if (!userId) return;
    try {
      // Cargar preferencia de sonido desde AsyncStorage
      const stored = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
      const isEnabled = stored !== null ? JSON.parse(stored) : true;
      soundEnabledRef.current = isEnabled;
      setSoundEnabled(isEnabled);

      const { data } = await supabase
        .from('configuracion_usuario')
        .select('sonido_enfoque, sonido_descanso')
        .eq('usuario_id', userId)
        .maybeSingle();
      
      if (data) {
        const newConfig = {
          sonido_enfoque: data.sonido_enfoque || 'lluvia_suave',
          sonido_descanso: data.sonido_descanso || 'olas_del_mar',
        };
        configRef.current = newConfig;
        setConfig(newConfig);
        configLoadedRef.current = true;

        // Si habia una fase pendiente (se intentó reproducir antes de cargar config)
        const pending = pendingPhaseRef.current;
        pendingPhaseRef.current = null;

        const phaseToPlay = pending ||
          (soundRef.current && currentPhaseRef.current ? currentPhaseRef.current : null);

        if (phaseToPlay && soundEnabledRef.current && !ambientSoundControl.isPaused()) {
          // Detener sonido anterior si existe (pudo haber empezado con defaults)
          const oldSound = soundRef.current;
          soundRef.current = null;
          if (oldSound) { try { await oldSound.unloadAsync(); } catch (_) {} }

          const soundId = phaseToPlay === 'estudio' ? newConfig.sonido_enfoque : newConfig.sonido_descanso;
          await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: true, allowsRecordingIOS: false });
          const { sound } = await Audio.Sound.createAsync(
            getSoundFile(soundId),
            { shouldPlay: true, isLooping: true, volume: 0.7 }
          );
          soundRef.current = sound;
          currentPhaseRef.current = phaseToPlay;
          setIsPlaying(true);
        }
      } else {
        // Sin config en BD, marcar como cargado igual para no bloquear
        configLoadedRef.current = true;
        if (pendingPhaseRef.current && soundEnabledRef.current && !ambientSoundControl.isPaused()) {
          const phase = pendingPhaseRef.current;
          pendingPhaseRef.current = null;
          // Reproducir con defaults (ya están en configRef)
          const soundId = phase === 'estudio' ? configRef.current.sonido_enfoque : configRef.current.sonido_descanso;
          await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: true, allowsRecordingIOS: false });
          const { sound } = await Audio.Sound.createAsync(
            getSoundFile(soundId),
            { shouldPlay: true, isLooping: true, volume: 0.7 }
          );
          soundRef.current = sound;
          currentPhaseRef.current = phase;
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Error loading sound config:', error);
    }
  }, [userId]);

  useEffect(() => {
    configLoadedRef.current = false;
    pendingPhaseRef.current = null;
    loadSoundConfig();
  }, [loadSoundConfig]);

  // Reproducir sonido según la fase
  const playAmbientSound = useCallback(async (phase) => {
    // No reproducir si está pausado externamente (ej: SoundsScreen abierta) o silenciado
    if (ambientSoundControl.isPaused() || !soundEnabledRef.current) return;

    // Si config aún no cargó, guardar fase pendiente y esperar
    if (!configLoadedRef.current) {
      pendingPhaseRef.current = phase;
      return;
    }
    
    const soundId = phase === 'estudio' ? configRef.current.sonido_enfoque : configRef.current.sonido_descanso;
    
    try {
      // Detener sonido actual si existe (solo unload, evita error si ya está descargado)
      const oldSound = soundRef.current;
      soundRef.current = null;
      if (oldSound) {
        try { await oldSound.unloadAsync(); } catch (_) {}
      }

      // Configurar modo de audio
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        allowsRecordingIOS: false,
      });

      // Crear y reproducir nuevo sonido en loop
      const { sound } = await Audio.Sound.createAsync(
        getSoundFile(soundId),
        {
          shouldPlay: true,
          isLooping: true,
          volume: 0.7,
        }
      );
      
      soundRef.current = sound;
      currentPhaseRef.current = phase;
      setIsPlaying(true);

      // Listener para cuando se detiene
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isPlaying) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Error playing ambient sound:', error);
    }
  }, [config]);

  // Detener sonido (keepPhase=true para mantener la fase al silenciar)
  const stopAmbientSound = useCallback(async (keepPhase = false) => {
    const sound = soundRef.current;
    soundRef.current = null;
    setIsPlaying(false);
    if (!keepPhase) {
      currentPhaseRef.current = null;
    }
    if (sound) {
      try {
        await sound.unloadAsync();
      } catch (_) {}
    }
  }, []);

  // Pausar/Reanudar
  const toggleAmbientSound = useCallback(async () => {
    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          await soundRef.current.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Error toggling ambient sound:', error);
    }
  }, []);

  // Suscripción Realtime para cambios inmediatos en configuración
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`config-sounds-${userId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'configuracion_usuario',
        filter: `usuario_id=eq.${userId}`,
      }, (payload) => {
        const newData = payload.new;
        // Actualizar config inmediatamente
        setConfig(prev => ({
          ...prev,
          sonido_enfoque: newData.sonido_enfoque || prev.sonido_enfoque,
          sonido_descanso: newData.sonido_descanso || prev.sonido_descanso,
          sonidos_timer: newData.sonidos_timer !== false && soundEnabled,
        }));
        
        // Si hay sonido reproduciéndose, cambiarlo inmediatamente
        if (soundRef.current && currentPhaseRef.current) {
          const wasPlaying = isPlaying;
          stopAmbientSound().then(() => {
            if (wasPlaying) {
              // Reproducir el nuevo sonido después de 100ms
              setTimeout(() => {
                playAmbientSound(currentPhaseRef.current);
              }, 100);
            }
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, isPlaying, soundEnabled]);

  // Escuchar cambios en AsyncStorage (cuando toggle desde useCycleNotification)
  useEffect(() => {
    const checkSoundEnabled = async () => {
      const stored = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
      const isEnabled = stored !== null ? JSON.parse(stored) : true;
      if (isEnabled !== soundEnabledRef.current) {
        soundEnabledRef.current = isEnabled;
        setSoundEnabled(isEnabled);
        if (!isEnabled) {
          // Silenciar: detener pero mantener la fase
          stopAmbientSound(true);
        }
        // Des-silenciar: useTimer lo detecta via soundEnabled y reinicia
      }
    };

    const interval = setInterval(checkSoundEnabled, 500);
    return () => clearInterval(interval);
  }, [stopAmbientSound]);

  // Escuchar eventos de pausa/reanudación desde SoundsScreen
  useEffect(() => {
    const unsubscribe = ambientSoundControl.subscribe(async (event) => {
      if (event === 'pause') {
        stopAmbientSound(true);
      } else if (event === 'resume') {
        await loadSoundConfig();
        // Solo reproducir si no hay sonido activo (evita reiniciar en chat/participantes)
        if (currentPhaseRef.current && soundEnabledRef.current && !soundRef.current && !ambientSoundControl.isPaused()) {
          playAmbientSound(currentPhaseRef.current);
        }
      }
    });
    return unsubscribe;
  }, [stopAmbientSound, loadSoundConfig, playAmbientSound]);

  return {
    playAmbientSound,
    stopAmbientSound,
    toggleAmbientSound,
    isPlaying,
    config,
    reloadConfig: loadSoundConfig,
    soundEnabled,
  };
};

export default useAmbientSound;
