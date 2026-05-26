import { useState, useEffect, useRef } from 'react';
import * as Network from 'expo-network';

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isCheckingReconnect, setIsCheckingReconnect] = useState(false);
  const prevConnected = useRef(true);

  useEffect(() => {
    const check = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        const connected = state.isConnected ?? true;

        if (connected && !prevConnected.current) {
          setIsCheckingReconnect(true);
          setTimeout(() => setIsCheckingReconnect(false), 2000);
        }

        prevConnected.current = connected;
        setIsConnected(connected);
      } catch {
        // Si falla la verificación, asumir conectado
      }
    };

    check();
    const interval = setInterval(check, 3000);
    return () => clearInterval(interval);
  }, []);

  return { isConnected, isCheckingReconnect };
};
