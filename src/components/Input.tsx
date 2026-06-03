// ============================================================
// TourOS POS — Input reutilizável com label e erro
// ============================================================

import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import { colors, borderRadius, spacing } from '../utils/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function Input({ label, error, style, ...rest }: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={colors.TEXT_MUTED}
        {...rest}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.TEXT,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.SURFACE,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.BORDER,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.TEXT,
  },
  inputError: {
    borderColor: colors.ERROR,
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: 13,
    color: colors.ERROR,
    marginTop: spacing.xs,
  },
});
