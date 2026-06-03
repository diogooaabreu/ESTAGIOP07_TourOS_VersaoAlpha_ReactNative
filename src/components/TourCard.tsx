// ============================================================
// TourOS POS — Card de Tour
// ============================================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'react-native';
import type { Tour } from '../types';

interface TourCardProps {
  tour: Tour;
  onPress: () => void;
}

/**
 * Determina o tipo de tour com base no type.id.
 * - type.id === 1 → "Tour" (fluxo completo: 4 passos)
 * - type.id === 2 → "Transfer" ou "Tuk-Tuk" (fluxo simples: 2 passos)
 */
function getTourTypeLabel(tour: Tour): string {
  if (tour.type.id === 1) return 'Tour';
  // Para type.id === 2, tentamos inferir pelo nome
  const name = tour.name.toLowerCase();
  if (name.includes('tuk') || name.includes('tuc')) return 'Tuk-Tuk';
  return 'Transfer';
}

function getTourTypeColor(tour: Tour): string {
  if (tour.type.id === 1) return '#4CAF50';
  const name = tour.name.toLowerCase();
  if (name.includes('tuk') || name.includes('tuc')) return '#FF9800';
  return '#2196F3';
}

export default function TourCard({ tour, onPress }: TourCardProps) {
  const imageUrl = tour.images?.[0]?.url;
  const typeLabel = getTourTypeLabel(tour);
  const typeColor = getTourTypeColor(tour);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Imagem */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            style={styles.image}
            source={{ uri: imageUrl }}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>📸</Text>
          </View>
        )}

        {/* Badge do tipo */}
        <View style={[styles.badge, { backgroundColor: typeColor }]}>
          <Text style={styles.badgeText}>{typeLabel}</Text>
        </View>
      </View>

      {/* Informação */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {tour.name}
        </Text>

        <Text style={styles.duration}>{tour.duration}</Text>

        <Text style={styles.price}>
          A partir de{' '}
          <Text style={styles.priceValue}>
            {tour.price.adult.toFixed(2).replace('.', ',')}€
          </Text>
        </Text>

        {/* Botão Reservar */}
        <TouchableOpacity style={styles.reserveButton} onPress={onPress}>
          <Text style={styles.reserveButtonText}>Reservar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ── Estilos ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 6,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 32,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  duration: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 6,
  },
  price: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 10,
  },
  priceValue: {
    color: '#E94560',
    fontWeight: 'bold',
    fontSize: 15,
  },
  reserveButton: {
    backgroundColor: '#E94560',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  reserveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
