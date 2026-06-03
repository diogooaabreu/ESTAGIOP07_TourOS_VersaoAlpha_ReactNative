// ============================================================
// TourOS POS — Estado global da Reserva (Zustand)
// ============================================================

import { create } from 'zustand';
import type { Tour } from '../types';
import { generateBookingCode } from '../utils/helpers';

// ── Interfaces auxiliares ───────────────────────────────────────────────

interface ContactoInfo {
  nome: string;
  apelido: string;
  email: string;
  telefone: string;
}

interface FaturacaoInfo {
  nome: string;
  apelido: string;
  empresa: string;
  nif: string;
  morada: string;
  cidade: string;
  distrito: string;
  codigoPostal: string;
  pais: string;
  telefone: string;
}

// ── Estado inicial ──────────────────────────────────────────────────────

const initialContacto: ContactoInfo = {
  nome: '',
  apelido: '',
  email: '',
  telefone: '',
};

const initialFaturacao: FaturacaoInfo = {
  nome: '',
  apelido: '',
  empresa: '',
  nif: '',
  morada: '',
  cidade: '',
  distrito: '',
  codigoPostal: '',
  pais: '',
  telefone: '',
};

// ── Interface do store ──────────────────────────────────────────────────

interface BookingState {
  // Estado
  tourId: number | null;
  tourData: Tour | null;
  selectedDate: string;
  selectedSlot: string;
  idioma: string;
  adultos: number;
  criancas: number;
  bebes: number;
  pickupTipo: string;
  pickupLocal: string;
  alergias: string;
  metodoPagamento: string;
  total: number;
  incluirContacto: boolean;
  incluirFaturacao: boolean;
  contacto: ContactoInfo;
  faturacao: FaturacaoInfo;
  nota: string;
  codigoGerado: string;

  // Acções
  setTour: (tourId: number, tourData: Tour) => void;
  setStep1: (date: string, slot: string, idioma: string) => void;
  setStep2: (adultos: number, criancas: number, bebes: number) => void;
  setStep3: (pickupTipo: string, pickupLocal: string, alergias: string) => void;
  setStep4: (
    metodoPagamento: string,
    contacto?: ContactoInfo,
    faturacao?: FaturacaoInfo,
    nota?: string,
  ) => void;
  calculateTotal: () => number;
  generateCode: () => string;
  resetBooking: () => void;
}

// ── Store ───────────────────────────────────────────────────────────────

export const useBookingStore = create<BookingState>((set, get) => ({
  // Estado inicial
  tourId: null,
  tourData: null,
  selectedDate: '',
  selectedSlot: '',
  idioma: 'pt',
  adultos: 1,
  criancas: 0,
  bebes: 0,
  pickupTipo: '',
  pickupLocal: '',
  alergias: '',
  metodoPagamento: 'dinheiro',
  total: 0,
  incluirContacto: false,
  incluirFaturacao: false,
  contacto: { ...initialContacto },
  faturacao: { ...initialFaturacao },
  nota: '',
  codigoGerado: '',

  // ── setTour ──────────────────────────────────────────────────────────

  setTour: (tourId: number, tourData: Tour) => {
    set({
      tourId,
      tourData,
      codigoGerado: generateBookingCode(),
    });
  },

  // ── setStep1 (Data, Slot, Idioma) ────────────────────────────────────

  setStep1: (date: string, slot: string, idioma: string) => {
    set({ selectedDate: date, selectedSlot: slot, idioma });
  },

  // ── setStep2 (Passageiros) ───────────────────────────────────────────

  setStep2: (adultos: number, criancas: number, bebes: number) => {
    set({ adultos, criancas, bebes });
  },

  // ── setStep3 (Pickup e alergias) ─────────────────────────────────────

  setStep3: (pickupTipo: string, pickupLocal: string, alergias: string) => {
    set({ pickupTipo, pickupLocal, alergias });
  },

  // ── setStep4 (Pagamento, Contacto, Faturação, Nota) ──────────────────

  setStep4: (
    metodoPagamento: string,
    contacto?: ContactoInfo,
    faturacao?: FaturacaoInfo,
    nota?: string,
  ) => {
    const incluirContacto = contacto !== undefined;
    const incluirFaturacao = faturacao !== undefined;

    set(state => ({
      metodoPagamento,
      contacto: contacto ?? state.contacto,
      faturacao: faturacao ?? state.faturacao,
      nota: nota ?? state.nota,
      incluirContacto,
      incluirFaturacao,
      total: state.calculateTotal(),
    }));
  },

  // ── calculateTotal ───────────────────────────────────────────────────

  calculateTotal: () => {
    const { tourData, adultos, criancas, bebes } = get();
    if (!tourData) return 0;

    const precoAdulto = tourData.price.adult ?? 0;
    const precoCrianca = tourData.price.child ?? 0;
    const precoBebe = tourData.price.baby ?? 0;

    const total =
      adultos * precoAdulto + criancas * precoCrianca + bebes * precoBebe;

    return total;
  },

  // ── generateCode ─────────────────────────────────────────────────────

  generateCode: () => {
    const code = generateBookingCode();
    set({ codigoGerado: code });
    return code;
  },

  // ── resetBooking ─────────────────────────────────────────────────────

  resetBooking: () => {
    set({
      tourId: null,
      tourData: null,
      selectedDate: '',
      selectedSlot: '',
      idioma: 'pt',
      adultos: 1,
      criancas: 0,
      bebes: 0,
      pickupTipo: '',
      pickupLocal: '',
      alergias: '',
      metodoPagamento: 'dinheiro',
      total: 0,
      incluirContacto: false,
      incluirFaturacao: false,
      contacto: { ...initialContacto },
      faturacao: { ...initialFaturacao },
      nota: '',
      codigoGerado: '',
    });
  },
}));
