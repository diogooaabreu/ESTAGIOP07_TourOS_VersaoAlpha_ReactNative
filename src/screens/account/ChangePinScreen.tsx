// ============================================================
// TourOS POS — Alterar PIN
// ============================================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { hashPin } from '../../utils/helpers';

type ChangePinNavProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ChangePin'
>;

export default function ChangePinScreen() {
  const navigation = useNavigation<ChangePinNavProp>();
  const { session, setPin } = useAuthStore();

  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Guardar ──────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    setError('');

    // Validações
    if (!currentPin || !newPin || !confirmPin) {
      setError('Preenche todos os campos.');
      return;
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setError('O novo PIN deve ter exatamente 4 dígitos.');
      return;
    }

    if (newPin === currentPin) {
      setError('O novo PIN deve ser diferente do atual.');
      return;
    }

    if (newPin !== confirmPin) {
      setError('A confirmação do novo PIN não coincide.');
      return;
    }

    setLoading(true);

    try {
      // Verificar PIN actual
      const currentHash = await hashPin(currentPin);
      if (currentHash !== session.pinHash) {
        setError('O PIN atual está incorreto.');
        setLoading(false);
        return;
      }

      // Hash do novo PIN e guardar
      const newHash = await hashPin(newPin);
      await setPin(newHash);

      Toast.show({
        type: 'success',
        text1: 'PIN alterado com sucesso',
      });

      navigation.goBack();
    } catch {
      setError('Ocorreu um erro ao alterar o PIN. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  }, [currentPin, newPin, confirmPin, session.pinHash, setPin, navigation]);

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Alterar PIN</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.form}>
          {/* PIN Actual */}
          <Text style={styles.label}>PIN actual</Text>
          <TextInput
            style={styles.input}
            placeholder="• • • •"
            placeholderTextColor="#999"
            value={currentPin}
            onChangeText={setCurrentPin}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            textAlign="center"
          />

          {/* Novo PIN */}
          <Text style={styles.label}>Novo PIN</Text>
          <TextInput
            style={styles.input}
            placeholder="• • • •"
            placeholderTextColor="#999"
            value={newPin}
            onChangeText={setNewPin}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            textAlign="center"
          />

          {/* Confirmar Novo PIN */}
          <Text style={styles.label}>Confirmar novo PIN</Text>
          <TextInput
            style={styles.input}
            placeholder="• • • •"
            placeholderTextColor="#999"
            value={confirmPin}
            onChangeText={setConfirmPin}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            textAlign="center"
          />

          {/* Mensagem de erro */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Botão Guardar */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Estilos ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  inner: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 32,
    color: '#1A1A2E',
    lineHeight: 34,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  form: {
    padding: 24,
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 14,
    fontSize: 24,
    color: '#1A1A2E',
    letterSpacing: 8,
  },
  errorContainer: {
    backgroundColor: '#FFF0F0',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFD0D0',
  },
  errorText: {
    fontSize: 14,
    color: '#E94560',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#E94560',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
