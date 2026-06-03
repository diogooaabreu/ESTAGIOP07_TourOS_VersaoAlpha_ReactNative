// ============================================================
// TourOS POS — Root Navigator
// ============================================================

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import PinUnlockScreen from '../screens/auth/PinUnlockScreen';

export default function RootNavigator() {
  const { isAuthenticated, isPinLocked, hydrate } = useAuthStore();
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const load = async () => {
      await hydrate();
      setIsHydrating(false);
    };
    load();
  }, [hydrate]);

  // Mostrar splash enquanto carrega o estado do AsyncStorage
  if (isHydrating) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Não autenticado → fluxo de login
  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  // Autenticado mas PIN bloqueado → ecrã de desbloqueio
  if (isPinLocked) {
    return <PinUnlockScreen />;
  }

  // Autenticado e desbloqueado → app principal
  return <MainNavigator />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
