// ============================================================
// TourOS POS — Ecrã de Sucesso da Reserva
// ============================================================

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BookingStackParamList } from '../../navigation/types';
import { useBookingStore } from '../../store/bookingStore';

type SuccessNavProp = NativeStackNavigationProp<
  BookingStackParamList,
  'BookingSuccess'
>;

export default function BookingSuccessScreen() {
  const navigation = useNavigation<SuccessNavProp>();
  const { codigoGerado, resetBooking } = useBookingStore();

  // Animação de escala do ícone de check
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  // ── Nova Reserva ─────────────────────────────────────────────────────

  const handleNewReservation = () => {
    resetBooking();
    // Voltar ao DashboardHome dentro do BookingNavigator
    navigation.reset({
      index: 0,
      routes: [{ name: 'DashboardHome' }],
    });
  };

  // ── Ver Reserva ──────────────────────────────────────────────────────

  const handleViewReservation = () => {
    const codigo = codigoGerado;
    resetBooking();
    // Navegar para o tab Reservas e abrir o detalhe
    navigation.getParent()?.navigate('Reservas', {
      screen: 'ReservaDetail',
      params: { codigo },
    });
  };

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {/* Ícone animado */}
        <Animated.View
          style={[styles.checkCircle, { transform: [{ scale: scaleAnim }] }]}
        >
          <Text style={styles.checkIcon}>✓</Text>
        </Animated.View>

        {/* Título */}
        <Text style={styles.title}>Reserva Confirmada!</Text>
        <Text style={styles.subtitle}>A reserva foi criada com sucesso.</Text>

        {/* Código da reserva */}
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Código da Reserva</Text>
          <Text style={styles.codeValue}>{codigoGerado}</Text>
        </View>

        {/* Botões */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleNewReservation}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Nova Reserva</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleViewReservation}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Ver Reserva</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkIcon: {
    fontSize: 40,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A2E',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
  },
  codeContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  codeLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  codeValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A2E',
    letterSpacing: 2,
  },
  primaryButton: {
    backgroundColor: '#E94560',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  secondaryButtonText: {
    color: '#1A1A2E',
    fontSize: 17,
    fontWeight: '600',
  },
});
