// ============================================================
// TourOS POS — Passo 3: Pickup e Alergias
// ============================================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BookingStackParamList } from '../../navigation/types';
import { useBookingStore } from '../../store/bookingStore';

type Step3NavProp = NativeStackNavigationProp<
  BookingStackParamList,
  'BookingStep3'
>;

const SUGESTOES_PICKUP = [
  'Guimarães Centro',
  'Braga',
  'Porto',
  'Albufeira',
  'Faro',
  'Lisboa',
];

export default function BookingStep3Screen() {
  const navigation = useNavigation<Step3NavProp>();
  const { pickupTipo, pickupLocal, alergias, setStep3 } = useBookingStore();

  const [localPickupTipo, setLocalPickupTipo] = useState(pickupTipo || 'grupo');
  const [localPickupLocal, setLocalPickupLocal] = useState(pickupLocal);
  const [localAlergias, setLocalAlergias] = useState(alergias);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // ── Filtrar sugestões ────────────────────────────────────────────────

  const filteredSuggestions = localPickupLocal
    ? SUGESTOES_PICKUP.filter(s =>
        s.toLowerCase().includes(localPickupLocal.toLowerCase()),
      )
    : SUGESTOES_PICKUP;

  // ── Continuar ────────────────────────────────────────────────────────

  const handleContinue = useCallback(() => {
    setStep3(localPickupTipo, localPickupLocal, localAlergias);
    navigation.navigate('BookingStep4');
  }, [localPickupTipo, localPickupLocal, localAlergias, setStep3, navigation]);

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Pickup</Text>
      <Text style={styles.subtitle}>
        Escolhe o tipo de pickup e localização
      </Text>

      {/* Radio: Ponto de grupo vs Zona de pickup */}
      <Text style={styles.sectionTitle}>Tipo de pickup</Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity
          style={[
            styles.radioOption,
            localPickupTipo === 'grupo' && styles.radioOptionSelected,
          ]}
          onPress={() => setLocalPickupTipo('grupo')}
        >
          <View style={styles.radioCircle}>
            {localPickupTipo === 'grupo' && (
              <View style={styles.radioCircleFilled} />
            )}
          </View>
          <View style={styles.radioTextContainer}>
            <Text style={styles.radioLabel}>Ponto de grupo</Text>
            <Text style={styles.radioDesc}>
              Encontro num ponto central definido
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.radioOption,
            localPickupTipo === 'zona' && styles.radioOptionSelected,
          ]}
          onPress={() => setLocalPickupTipo('zona')}
        >
          <View style={styles.radioCircle}>
            {localPickupTipo === 'zona' && (
              <View style={styles.radioCircleFilled} />
            )}
          </View>
          <View style={styles.radioTextContainer}>
            <Text style={styles.radioLabel}>Zona de pickup</Text>
            <Text style={styles.radioDesc}>
              Pickup personalizado numa zona específica
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Zona de pickup (só se "zona") */}
      {localPickupTipo === 'zona' && (
        <View style={styles.pickupZoneContainer}>
          <Text style={styles.sectionTitle}>Local de pickup</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Guimarães Centro"
            placeholderTextColor="#999"
            value={localPickupLocal}
            onChangeText={text => {
              setLocalPickupLocal(text);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />

          {/* Sugestões */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {filteredSuggestions.map(sugestao => (
                <TouchableOpacity
                  key={sugestao}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setLocalPickupLocal(sugestao);
                    setShowSuggestions(false);
                  }}
                >
                  <Text style={styles.suggestionText}>{sugestao}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Alergias / Restrições */}
      <Text style={styles.sectionTitle}>Alergias / Restrições</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Indica alergias ou restrições alimentares..."
        placeholderTextColor="#999"
        value={localAlergias}
        onChangeText={setLocalAlergias}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      {/* Botão Continuar */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={handleContinue}
        activeOpacity={0.8}
      >
        <Text style={styles.continueButtonText}>Continuar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── Estilos ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 12,
    marginTop: 8,
  },
  radioGroup: {
    gap: 10,
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  radioOptionSelected: {
    borderColor: '#1A1A2E',
    backgroundColor: '#F0F0F5',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioCircleFilled: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1A1A2E',
  },
  radioTextContainer: {
    flex: 1,
  },
  radioLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  radioDesc: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  pickupZoneContainer: {
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1A1A2E',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 4,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionText: {
    fontSize: 15,
    color: '#1A1A2E',
  },
  continueButton: {
    backgroundColor: '#E94560',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
