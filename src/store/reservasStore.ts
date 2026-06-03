// ============================================================
// TourOS POS — Estado global de Reservas (Zustand)
// ============================================================

import { create } from 'zustand';
import type { Reserva } from '../types';
import {
  getAllReservas,
  cancelarReserva as cancelarReservaDB,
  remarcarReserva as remarcarReservaDB,
} from '../db/reservaRepository';

// ── Tipos de filtro ─────────────────────────────────────────────────────

type ReservasFilter = 'all' | 'today' | 'week' | 'cancelled';

// ── Interface do store ──────────────────────────────────────────────────

interface ReservasState {
  reservas: Reserva[];
  loading: boolean;
  filter: ReservasFilter;
  searchQuery: string;

  // Acções
  loadReservas: (userId: number) => Promise<void>;
  cancelarReserva: (codigo: string) => Promise<void>;
  remarcarReserva: (codigo: string, novaData: string) => Promise<void>;
  setFilter: (filter: ReservasFilter) => void;
  setSearchQuery: (query: string) => void;
  getFilteredReservas: () => Reserva[];
}

// ── Helpers de data ─────────────────────────────────────────────────────

function getTodayStr(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getWeekEndStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ── Store ───────────────────────────────────────────────────────────────

export const useReservasStore = create<ReservasState>((set, get) => ({
  reservas: [],
  loading: false,
  filter: 'all',
  searchQuery: '',

  // ── loadReservas ─────────────────────────────────────────────────────

  loadReservas: async (userId: number) => {
    set({ loading: true });

    try {
      const reservas = await getAllReservas(userId);
      set({ reservas, loading: false });
    } catch (error) {
      console.error('[ReservasStore] Erro ao carregar reservas:', error);
      set({ loading: false });
    }
  },

  // ── cancelarReserva ──────────────────────────────────────────────────

  cancelarReserva: async (codigo: string) => {
    try {
      const reservaActualizada = await cancelarReservaDB(codigo);
      if (reservaActualizada) {
        set(state => ({
          reservas: state.reservas.map(r =>
            r.codigo === codigo ? reservaActualizada : r,
          ),
        }));
      }
    } catch (error) {
      console.error('[ReservasStore] Erro ao cancelar reserva:', error);
      throw error;
    }
  },

  // ── remarcarReserva ──────────────────────────────────────────────────

  remarcarReserva: async (codigo: string, novaData: string) => {
    try {
      const reservaActualizada = await remarcarReservaDB(codigo, novaData);
      if (reservaActualizada) {
        set(state => ({
          reservas: state.reservas.map(r =>
            r.codigo === codigo ? reservaActualizada : r,
          ),
        }));
      }
    } catch (error) {
      console.error('[ReservasStore] Erro ao remarcar reserva:', error);
      throw error;
    }
  },

  // ── setFilter ────────────────────────────────────────────────────────

  setFilter: (filter: ReservasFilter) => {
    set({ filter });
  },

  // ── setSearchQuery ───────────────────────────────────────────────────

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  // ── getFilteredReservas ──────────────────────────────────────────────

  getFilteredReservas: () => {
    const { reservas, filter, searchQuery } = get();

    // 1. Aplicar filtro de data/estado
    let filtered = reservas;

    if (filter === 'today') {
      const today = getTodayStr();
      filtered = filtered.filter(r => r.dataReserva === today);
    } else if (filter === 'week') {
      const today = getTodayStr();
      const weekEnd = getWeekEndStr();
      filtered = filtered.filter(
        r => r.dataReserva >= today && r.dataReserva <= weekEnd,
      );
    } else if (filter === 'cancelled') {
      filtered = filtered.filter(r => r.estado === 'cancelada');
    }

    // 2. Aplicar pesquisa por texto
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        r =>
          r.codigo.toLowerCase().includes(query) ||
          r.tourNome.toLowerCase().includes(query) ||
          r.contactoNome?.toLowerCase().includes(query) ||
          r.contactoApelido?.toLowerCase().includes(query) ||
          r.balcao?.toLowerCase().includes(query),
      );
    }

    return filtered;
  },
}));
