// ============================================================
// TourOS POS — Card de Reserva (para listagem)
// ============================================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Reserva } from '../types';

interface ReservaCardProps {
  reserva: Reserva;
  onPress: () => void;
}

function getEstadoBadge(estado: string): { label: string; color: string } {
  switch (estado) {
    case 'confirmada':
      return { label: 'Confirmada', color: '#4CAF50' };
    case 'cancelada':
      return { label: 'Cancelada', color: '#E94560' };
    default:
      return { label: estado, color: '#666666' };
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export default function ReservaCard({ reserva, onPress }: ReservaCardProps) {
  const badge = getEstadoBadge(reserva.estado);
  const totalPassageiros = reserva.adultos + reserva.criancas + reserva.bebes;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Topo: código + badge */}
      <View style={styles.topRow}>
        <Text style={styles.codigo}>{reserva.codigo}</Text>
        <View style={[styles.badge, { backgroundColor: badge.color }]}>
          <Text style={styles.badgeText}>{badge.label}</Text>
        </View>
      </View>

      {/* Nome do tour */}
      <Text style={styles.tourNome} numberOfLines={1}>
        {reserva.tourNome}
      </Text>

      {/* Data e hora */}
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>
          {formatDate(reserva.dataReserva)}
          {reserva.horaPartida ? ` às ${reserva.horaPartida}` : ''}
        </Text>
      </View>

      {/* Passageiros e total */}
      <View style={styles.bottomRow}>
        <Text style={styles.passageiros}>
          {totalPassageiros} passageiro{totalPassageiros !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.total}>
          {reserva.total.toFixed(2).replace('.', ',')}€
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Estilos ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codigo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A2E',
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tourNome: {
    fontSize: 16,
    color: '#1A1A2E',
    marginBottom: 6,
  },
  infoRow: {
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666666',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
  },
  passageiros: {
    fontSize: 13,
    color: '#666666',
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E94560',
  },
});
