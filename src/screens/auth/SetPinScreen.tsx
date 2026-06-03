// ============================================================
// TourOS POS — Ecrã de Definição de PIN
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
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
import { updateUser } from '../../db/userRepository';

type SetPinNavProp = NativeStackNavigationProp<AuthStackParamList, 'SetPin'>;

export default function SetPinScreen() {
  const navigation = useNavigation<SetPinNavProp>();
  const { user, setPin } = useAuthStore();

  const [pin, setPinState] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Guardar PIN ──────────────────────────────────────────────────────

  const handleSave = async () => {
    setError('');

    // Validações
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError('O PIN deve ter exatamente 4 dígitos.');
      return;
    }

    if (pin !== confirmPin) {
      setError('Os PINs não coincidem.');
      return;
    }

    setLoading(true);

    try {
      const pinHashed = await hashPin(pin);

      // Guardar na BD
      if (user) {
        await updateUser(user.id, { pinHash: pinHashed });
      }

      // Guardar no store
      await setPin(pinHashed);

      // Navegar para SelectBalcao
      navigation.reset({ index: 0, routes: [{ name: 'SelectBalcao' }] });
    } catch (err) {
      console.error('[SetPinScreen] Erro:', err);
      setError('Ocorreu um erro ao guardar o PIN.');
    } finally {
      setLoading(false);
    }
  };

  // ── Saltar ───────────────────────────────────────────────────────────

  const handleSkip = () => {
    navigation.reset({ index: 0, routes: [{ name: 'SelectBalcao' }] });
  };

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Definir PIN</Text>
        <Text style={styles.subtitle}>
          Escolhe um PIN de 4 dígitos para acesso rápido
        </Text>

        {/* Novo PIN */}
        <Text style={styles.label}>Novo PIN</Text>
        <TextInput
          style={styles.input}
          placeholder="• • • •"
          placeholderTextColor="#999"
          value={pin}
          onChangeText={setPinState}
          keyboardType="number-pad"
          maxLength={4}
          secureTextEntry
        />

        {/* Confirmar PIN */}
        <Text style={styles.label}>Confirmar PIN</Text>
        <TextInput
          style={styles.input}
          placeholder="• • • •"
          placeholderTextColor="#999"
          value={confirmPin}
          onChangeText={setConfirmPin}
          keyboardType="number-pad"
          maxLength={4}
          secureTextEntry
        />

        {/* Mensagem de erro */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Botão Guardar */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {loading ? 'A guardar...' : 'Guardar PIN'}
          </Text>
        </TouchableOpacity>

        {/* Saltar */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Saltar</Text>
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 20,
    color: '#1C1C1E',
    backgroundColor: '#F9F9F9',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 8,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  skipButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  skipText: {
    color: '#007AFF',
    fontSize: 15,
  },
});
