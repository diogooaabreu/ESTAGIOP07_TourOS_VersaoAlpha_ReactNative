// ============================================================
// TourOS POS — Card reutilizável com sombra
// ============================================================

import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { colors, borderRadius, shadows } from '../utils/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.SURFACE,
    borderRadius: borderRadius.lg,
    padding: 16,
    ...shadows.card,
  },
});
