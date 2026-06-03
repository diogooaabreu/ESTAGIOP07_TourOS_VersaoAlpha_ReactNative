// ============================================================
// TourOS POS — Entry Point
// ============================================================

import React, { useEffect, useState } from 'react';
import { StatusBar, ActivityIndicator, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation';
import { initDatabase } from './src/db/database';
import { useAuthStore } from './src/store/authStore';
import { colors } from './src/utils/theme';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const hydrate = useAuthStore(state => state.hydrate);

  useEffect(() => {
    async function bootstrap() {
      try {
        // 1. Inicializar base de dados SQLite
        await initDatabase();

        // 2. Carregar sessão do AsyncStorage
        await hydrate();
      } catch (error) {
        console.error('[App] Erro no bootstrap:', error);
      } finally {
        setIsReady(true);
      }
    }

    bootstrap();
  }, [hydrate]);

  if (!isReady) {
    return (
      <View style={styles.splash}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.SECONDARY}
        />
        <ActivityIndicator size="large" color={colors.PRIMARY} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.BACKGROUND} />
      <AppNavigator />
      <Toast />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.SECONDARY,
  },
});
