// ============================================================
// TourOS POS — Passo 2: Passageiros
// ============================================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BookingStackParamList } from '../../navigation/types';
import { useBookingStore } from '../../store/bookingStore';

type Step2NavProp = NativeStackNavigationProp<
  BookingStackParamList,
  'BookingStep2'
>;

interface PassengerCounterProps {
  label: string;
  subtitle: string;
  value: number;
  price: number;
  min?: number;
  max?: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

function PassengerCounter({
  label,
  subtitle,
  value,
  price,
  min = 0,
  max = 20,
  onIncrement,
  onDecrement,
}: PassengerCounterProps) {
  const subtotal = value * price;
  return (
    <View style={styles.counterCard}>
      <View style={styles.counterInfo}>
        <Text style={styles.counterLabel}>{label}</Text>
        <Text style={styles.counterSubtitle}>{subtitle}</Text>
        <Text style={styles.counterPrice}>
          {price.toFixed(2).replace('.', ',')}€ / pessoa
        </Text>
      </View>
      <View style={styles.counterControls}>
        <TouchableOpacity
          style={[styles.counterBtn, value <= min && styles.counterBtnDisabled]}
          onPress={onDecrement}
          disabled={value <= min}
        >
          <Text
            style={[
              styles.counterBtnText,
              value <= min && styles.counterBtnTextDisabled,
            ]}
          >
            −
          </Text>
        </TouchableOpacity>
        <Text style={styles.counterValue}>{value}</Text>
        <TouchableOpacity
          style={[styles.counterBtn, value >= max && styles.counterBtnDisabled]}
          onPress={onIncrement}
          disabled={value >= max}
        >
          <Text
            style={[
              styles.counterBtnText,
              value >= max && styles.counterBtnTextDisabled,
            ]}
          >
            +
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.counterSubtotal}>
        Subtotal: {subtotal.toFixed(2).replace('.', ',')}€
      </Text>
    </View>
  );
}

export default function BookingStep2Screen() {
  const navigation = useNavigation<Step2NavProp>();
  const { tourData, adultos, criancas, bebes, setStep2 } = useBookingStore();

  const [localAdultos, setLocalAdultos] = useState(adultos);
  const [localCriancas, setLocalCriancas] = useState(criancas);
  const [localBebes, setLocalBebes] = useState(bebes);

  const totalPessoas = localAdultos + localCriancas + localBebes;
  const precoAdulto = tourData?.price.adult ?? 0;
  const precoCrianca = tourData?.price.child ?? 0;
  const precoBebe = tourData?.price.baby ?? 0;
  const total =
    localAdultos * precoAdulto +
    localCriancas * precoCrianca +
    localBebes * precoBebe;

  const handleContinue = useCallback(() => {
    setStep2(localAdultos, localCriancas, localBebes);
    navigation.navigate('BookingStep3');
  }, [localAdultos, localCriancas, localBebes, setStep2, navigation]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Número de Passageiros</Text>
      <Text style={styles.subtitle}>
        Total: {totalPessoas} pessoa{totalPessoas !== 1 ? 's' : ''} (máx. 20)
      </Text>

      {/* Adultos */}
      <PassengerCounter
        label="Adultos"
        subtitle="12+ anos"
        value={localAdultos}
        price={precoAdulto}
        min={1}
        max={20}
        onIncrement={() => setLocalAdultos(prev => Math.min(prev + 1, 20))}
        onDecrement={() => setLocalAdultos(prev => Math.max(prev - 1, 1))}
      />

      {/* Crianças */}
      <PassengerCounter
        label="Crianças"
        subtitle="2-11 anos"
        value={localCriancas}
        price={precoCrianca}
        max={20}
        onIncrement={() => setLocalCriancas(prev => Math.min(prev + 1, 20))}
        onDecrement={() => setLocalCriancas(prev => Math.max(prev - 1, 0))}
      />

      {/* Bebés */}
      <PassengerCounter
        label="Bebés"
        subtitle="0-1 anos"
        value={localBebes}
        price={precoBebe}
        max={20}
        onIncrement={() => setLocalBebes(prev => Math.min(prev + 1, 20))}
        onDecrement={() => setLocalBebes(prev => Math.max(prev - 1, 0))}
      />

      {/* Total geral */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total estimado</Text>
        <Text style={styles.totalValue}>
          {total.toFixed(2).replace('.', ',')}€
        </Text>
      </View>

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
  counterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  counterInfo: {
    marginBottom: 12,
  },
  counterLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  counterSubtitle: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  counterPrice: {
    fontSize: 13,
    color: '#E94560',
    marginTop: 4,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  counterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnDisabled: {
    backgroundColor: '#CCCCCC',
  },
  counterBtnText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  counterBtnTextDisabled: {
    color: '#999999',
  },
  counterValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A2E',
    minWidth: 40,
    textAlign: 'center',
  },
  counterSubtotal: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'right',
    marginTop: 8,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E94560',
  },
  continueButton: {
    backgroundColor: '#E94560',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
