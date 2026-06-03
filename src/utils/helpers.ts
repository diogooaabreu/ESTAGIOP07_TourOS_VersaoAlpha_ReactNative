// ============================================================
// TourOS POS — Funções auxiliares
// ============================================================

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { sha256 } from 'react-native-sha256';

dayjs.extend(customParseFormat);

/**
 * Formata uma data ISO (yyyy-MM-dd) para o formato português (dd/MM/yyyy).
 * Exemplo: "2026-05-18" → "18/05/2026"
 */
export function formatDate(date: string): string {
  const d = dayjs(date, 'YYYY-MM-DD');
  return d.isValid() ? d.format('DD/MM/YYYY') : date;
}

/**
 * Formata um valor numérico para moeda Euro (€).
 * Exemplo: 25 → "25,00€"
 */
export function formatEuro(value: number): string {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

/**
 * Gera um código de reserva no formato TOS-XXXXXXXXX.
 * Exemplo: "TOS-A3kF9pQ2z"
 */
export function generateBookingCode(): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'TOS-';
  for (let i = 0; i < 9; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Extrai as iniciais de um nome.
 * Exemplo: "João Silva" → "JS"
 */
export function getInitials(name: string): string {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
}

/**
 * Gera o hash SHA-256 de um PIN.
 * Usa a native module react-native-sha256 para performance.
 */
export async function hashPin(pin: string): Promise<string> {
  return sha256(pin);
}
