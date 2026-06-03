// ============================================================
// TourOS POS — Ecrã de Login com PIN
// ============================================================

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { getUserByEmail } from '../../db/userRepository';
import { hashPin } from '../../utils/helpers';
import PinPad, { type PinPadRef } from '../../components/PinPad';

type PinLoginNavProp = NativeStackNavigationProp<
  AuthStackParamList,
  'PinLogin'
>;

export default function PinLoginScreen() {
  const navigation = useNavigation<PinLoginNavProp>();
  const { login } = useAuthStore();
  const pinPadRef = useRef<PinPadRef>(null);

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  // ── Verificar PIN ────────────────────────────────────────────────────

  const handlePinComplete = useCallback(
    async (pin: string) => {
      setError('');

      if (!email.trim()) {
        setError('Introduz primeiro o teu email.');
        pinPadRef.current?.reset();
        return;
      }

      try {
        const user = await getUserByEmail(email.trim().toLowerCase());

        if (!user) {
          setError('Email não encontrado.');
          pinPadRef.current?.shake();
          pinPadRef.current?.reset();
          return;
        }

        if (!user.pinHash) {
          setError('Este utilizador não tem PIN definido.');
          pinPadRef.current?.shake();
          pinPadRef.current?.reset();
          return;
        }

        // Verificar PIN
        const pinHashed = await hashPin(pin);

        if (pinHashed !== user.pinHash) {
          setError('PIN incorreto. Tenta novamente.');
          pinPadRef.current?.shake();
          pinPadRef.current?.reset();
          return;
        }

        // PIN correto → fazer login e ir para SelectBalcao
        await login(user, '');
        navigation.reset({ index: 0, routes: [{ name: 'SelectBalcao' }] });
      } catch (err) {
        console.error('[PinLoginScreen] Erro:', err);
        setError('Ocorreu um erro. Tenta novamente.');
        pinPadRef.current?.reset();
      }
    },
    [email, login, navigation],
  );

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Login com PIN</Text>
        <Text style={styles.subtitle}>
          Introduz o teu email e o PIN de 4 dígitos
        </Text>

        {/* Email */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* PinPad */}
        <PinPad
          ref={pinPadRef}
          pinLength={4}
          onComplete={handlePinComplete}
          errorMessage={error}
        />
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
  title: {
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
    marginBottom: 40,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1C1C1E',
    backgroundColor: '#F9F9F9',
    marginBottom: 32,
  },
});
