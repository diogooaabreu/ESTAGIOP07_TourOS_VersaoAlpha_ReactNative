// ============================================================
// TourOS POS — Hook de timeout de sessão (PIN)
// ============================================================

import { useEffect, useRef, useCallback } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useAuthStore } from '../store/authStore';

const CHECK_INTERVAL_MS = 30_000; // 30 segundos

/**
 * Monitoriza a inactividade do utilizador e bloqueia o PIN
 * se estiver mais de 5 minutos sem interacção.
 *
 * Deve ser importado no MainNavigator para estar activo
 * em toda a app autenticada.
 */
export function useSessionTimeout() {
  const checkPinTimeout = useAuthStore(state => state.checkPinTimeout);
  const updateLastActivity = useAuthStore(state => state.updateLastActivity);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Verificação periódica ────────────────────────────────────────────

  const startChecking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      checkPinTimeout();
    }, CHECK_INTERVAL_MS);
  }, [checkPinTimeout]);

  const stopChecking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // ── AppState (detectar background/foreground) ────────────────────────

  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        // A app voltou ao primeiro plano — verificar se expirou
        checkPinTimeout();
        startChecking();
      } else if (nextState === 'background') {
        // App foi para background — actualizar última actividade
        updateLastActivity();
        stopChecking();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);

    // Iniciar verificação
    startChecking();

    return () => {
      subscription.remove();
      stopChecking();
    };
  }, [checkPinTimeout, updateLastActivity, startChecking, stopChecking]);

  // ── Função para chamar quando o utilizador interage ──────────────────

  const handleUserInteraction = useCallback(() => {
    updateLastActivity();
  }, [updateLastActivity]);

  return { handleUserInteraction };
}
