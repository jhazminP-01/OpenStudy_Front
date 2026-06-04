import { useContext } from 'react';
import { BanContext } from '../context/BanContext';

export const useBan = () => {
  const context = useContext(BanContext);
  if (!context) {
    throw new Error('useBan debe usarse dentro de BanProvider');
  }
  return context;
};
