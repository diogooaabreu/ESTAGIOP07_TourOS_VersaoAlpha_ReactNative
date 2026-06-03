// ============================================================
// TourOS POS — Badge colorido (chip)
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { borderRadius } from '../utils/theme';

type BadgeColor = 'green' | 'red' | 'yellow' | 'grey';

interface BadgeProps {
  label: string;
  color?: BadgeColor;
}

const BADGE_COLORS: Record<BadgeColor, { bg: string; text: string }> = {
  green: { bg: '#E8F5E9', text: '#2E7D32' },
  red: { bg: '#FFEBEE', text: '#C62828' },
  yellow: { bg: '#FFF8E1', text: '#F57F17' },
  grey: { bg: '#F5F5F5', text: '#616161' },
};

export default function Badge({ label, color = 'grey' }: BadgeProps) {
  const palette = BADGE_COLORS[color];

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
