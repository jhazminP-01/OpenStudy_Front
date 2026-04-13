import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';
import LoadingScreen from '../components/common/LoadingScreen';

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? <TabNavigator /> : <AuthNavigator />;
};
