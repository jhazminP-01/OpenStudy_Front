import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useBan } from '../hooks/useBan';
import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';
import BannedScreen from '../screens/auth/BannedScreen';
import LoadingScreen from '../components/common/LoadingScreen';

export const AppNavigator = () => {
  const { user, loading } = useAuth();
  const { banData } = useBan();

  if (loading) {
    return <LoadingScreen />;
  }

  if (banData) {
    return <BannedScreen route={{ params: { banData } }} />;
  }

  return user ? <TabNavigator /> : <AuthNavigator />;
};
