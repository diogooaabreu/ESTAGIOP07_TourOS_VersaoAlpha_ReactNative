// ============================================================
// TourOS POS — Estado global de Autenticação (Zustand)
// ============================================================

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, Session } from '../types';
import { PIN_TIMEOUT_MS } from '../utils/constants';

// ── Chaves do AsyncStorage ──────────────────────────────────────────────

const STORAGE_KEYS = {
  USER: '@tourpos/user',
  SESSION: '@tourpos/session',
} as const;

// ── Estado inicial ──────────────────────────────────────────────────────

const initialSession: Session = {
  userId: null,
  userName: '',
  userEmail: '',
  pinHash: '',
  balcao: '',
  lastActivityAt: Date.now(),
  isPinLocked: false,
};

// ── Interface do store ──────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  session: Session;
  isAuthenticated: boolean;
  isPinLocked: boolean;

  // Hydrate (carregar do AsyncStorage ao iniciar)
  hydrate: () => Promise<void>;

  // Acções
  login: (user: User, balcao: string) => Promise<void>;
  logout: () => Promise<void>;
  lockPin: () => void;
  unlockPin: () => void;
  setBalcao: (balcao: string) => Promise<void>;
  updateLastActivity: () => void;
  checkPinTimeout: () => boolean;
  setPin: (pinHash: string) => Promise<void>;
}

// ── Store ───────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: { ...initialSession },
  isAuthenticated: false,
  isPinLocked: false,

  // ── Hydrate ──────────────────────────────────────────────────────────

  hydrate: async () => {
    try {
      const [userJson, sessionJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.SESSION),
      ]);

      const user: User | null = userJson ? JSON.parse(userJson) : null;
      const session: Session | null = sessionJson
        ? JSON.parse(sessionJson)
        : null;

      if (user && session) {
        // Verificar se o PIN expirou durante o fecho da app
        const now = Date.now();
        const elapsed = now - session.lastActivityAt;
        const isLocked = elapsed > PIN_TIMEOUT_MS;

        set({
          user,
          session: {
            ...session,
            lastActivityAt: now,
            isPinLocked: isLocked,
          },
          isAuthenticated: true,
          isPinLocked: isLocked,
        });
      }
    } catch (error) {
      console.error('[AuthStore] Erro ao hidratar:', error);
    }
  },

  // ── Login ────────────────────────────────────────────────────────────

  login: async (user: User, balcao: string) => {
    const session: Session = {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      pinHash: user.pinHash ?? '',
      balcao,
      lastActivityAt: Date.now(),
      isPinLocked: false,
    };

    // Persistir
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
      AsyncStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session)),
    ]);

    set({
      user,
      session,
      isAuthenticated: true,
      isPinLocked: false,
    });
  },

  // ── Logout ───────────────────────────────────────────────────────────

  logout: async () => {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.USER),
      AsyncStorage.removeItem(STORAGE_KEYS.SESSION),
    ]);

    set({
      user: null,
      session: { ...initialSession },
      isAuthenticated: false,
      isPinLocked: false,
    });
  },

  // ── Bloquear PIN ─────────────────────────────────────────────────────

  lockPin: () => {
    set(state => ({
      session: { ...state.session, isPinLocked: true },
      isPinLocked: true,
    }));
  },

  // ── Desbloquear PIN ──────────────────────────────────────────────────

  unlockPin: () => {
    const now = Date.now();
    set(state => ({
      session: {
        ...state.session,
        isPinLocked: false,
        lastActivityAt: now,
      },
      isPinLocked: false,
    }));
  },

  // ── Definir/Alterar balcão ───────────────────────────────────────────

  setBalcao: async (balcao: string) => {
    const updatedSession = { ...get().session, balcao };
    await AsyncStorage.setItem(
      STORAGE_KEYS.SESSION,
      JSON.stringify(updatedSession),
    );
    set({ session: updatedSession });
  },

  // ── Actualizar última actividade ─────────────────────────────────────

  updateLastActivity: () => {
    const now = Date.now();
    set(state => ({
      session: { ...state.session, lastActivityAt: now },
    }));
  },

  // ── Verificar timeout do PIN ─────────────────────────────────────────

  checkPinTimeout: () => {
    const { session } = get();
    const elapsed = Date.now() - session.lastActivityAt;
    const isTimedOut = elapsed > PIN_TIMEOUT_MS;

    if (isTimedOut && !session.isPinLocked) {
      set(state => ({
        session: { ...state.session, isPinLocked: true },
        isPinLocked: true,
      }));
      return true;
    }

    return session.isPinLocked;
  },

  // ── Definir/Alterar PIN ──────────────────────────────────────────────

  setPin: async (pinHash: string) => {
    const updatedSession = { ...get().session, pinHash };
    await AsyncStorage.setItem(
      STORAGE_KEYS.SESSION,
      JSON.stringify(updatedSession),
    );
    set({ session: updatedSession });
  },
}));
