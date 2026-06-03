// ============================================================
// TourOS POS — Ecrã de Desbloqueio de PIN
// ============================================================

import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { hashPin } from '../../utils/helpers';
import PinPad, { type PinPadRef } from '../../components/PinPad';

type PinUnlockNavProp = NativeStackNavigationProp<
  AuthStackParamList,
  'PinUnlock'
>;

export default function PinUnlockScreen() {
  const navigation = useNavigation<PinUnlockNavProp>();
  const { user, session, unlockPin, logout } = useAuthStore();
  const pinPadRef = useRef<PinPadRef>(null);

  // ── Verificar PIN ────────────────────────────────────────────────────

  const handlePinComplete = useCallback(
    async (pin: string) => {
      try {
        const pinHashed = await hashPin(pin);

        if (pinHashed !== session.pinHash) {
          pinPadRef.current?.shake();
          pinPadRef.current?.reset();
          return;
        }

        // PIN correto → desbloquear
        unlockPin();
      } catch (err) {
        console.error('[PinUnlockScreen] Erro:', err);
        pinPadRef.current?.reset();
      }
    },
    [session.pinHash, unlockPin],
  );

  // ── Trocar utilizador ────────────────────────────────────────────────

  const handleSwitchUser = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        {/* Saudação */}
        <Text style={styles.greeting}>Olá, {user?.name ?? 'Utilizador'}</Text>
        <Text style={styles.subtitle}>
          A sessão expirou. Introduz o teu PIN para continuar.
        </Text>

        {/* PinPad */}
        <PinPad ref={pinPadRef} pinLength={4} onComplete={handlePinComplete} />

        {/* Trocar utilizador */}
        <TouchableOpacity
          style={styles.switchButton}
          onPress={handleSwitchUser}
        >
          <Text style={styles.switchText}>Trocar utilizador</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── Estilos ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
    paddingHorizontal: 16,
  },
  switchButton: {
    marginTop: 32,
    alignItems: 'center',
  },
  switchText: {
    color: '#007AFF',
    fontSize: 15,
  },
});
