// ============================================================
// TourOS POS — Hook useTours
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { getActiveExperiences } from '../api/experienceService';
import type { Tour } from '../types';

interface UseToursResult {
  tours: Tour[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Custom hook que carrega a lista de tours activos da API TourOS.
 *
 * - Chama experienceService.getActiveExperiences() ao montar
 * - Gere os estados loading, error e dados
 * - Expõe uma função refresh() para recarregar manualmente
 *
 * @param language Código do idioma (default: 'pt')
 */
export function useTours(language: string = 'pt'): UseToursResult {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadTours = useCallback(
    async (forceRefresh: boolean = false) => {
      setLoading(true);
      setError(null);

      try {
        const data = await getActiveExperiences(language, forceRefresh);
        setTours(data);
      } catch (err: any) {
        const message =
          err?.message ?? 'Erro ao carregar tours. Tente novamente.';
        setError(message);
        console.error('[useTours] Erro:', message);
      } finally {
        setLoading(false);
      }
    },
    [language],
  );

  // Carregar ao montar o componente
  useEffect(() => {
    loadTours();
  }, [loadTours]);

  // Função para recarregar (força refresh do cache)
  const refresh = useCallback(() => {
    loadTours(true);
  }, [loadTours]);

  return { tours, loading, error, refresh };
}
