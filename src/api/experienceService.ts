// ============================================================
// TourOS POS — Serviço de Experiências com Cache
// ============================================================

import { getExperience } from './tourService';
import type { Tour } from '../types';

// ── IDs activos fornecidos pelo orientador ──────────────────────────────

const ACTIVE_IDS = [55, 45, 44, 42, 39, 12];

// ── Cache em memória ────────────────────────────────────────────────────

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos

interface CacheEntry {
  data: Tour[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

/**
 * Busca todas as experiências activas da API TourOS.
 *
 * Itera pelos 6 IDs activos, filtra apenas as com status === 'active',
 * e guarda o resultado em cache por 30 minutos por idioma.
 *
 * @param language    Código do idioma (ex: 'pt', 'en', 'fr', 'es')
 * @param forceRefresh  Se true, ignora o cache e força re-fetch
 */
export async function getActiveExperiences(
  language: string = 'pt',
  forceRefresh: boolean = false,
): Promise<Tour[]> {
  const cacheKey = `experiences:${language}`;

  // Verificar cache
  if (!forceRefresh) {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  // Buscar todas as experiências em paralelo
  const results = await Promise.allSettled(
    ACTIVE_IDS.map(id => getExperience(id, language)),
  );

  const tours: Tour[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      const tour = result.value;
      if (tour.status === 'active') {
        tours.push(tour);
      }
    } else {
      // Log do erro mas continuar com os restantes
      console.warn('[ExperienceService] Erro ao carregar tour:', result.reason);
    }
  }

  // Actualizar cache
  cache.set(cacheKey, { data: tours, timestamp: Date.now() });

  return tours;
}

/**
 * Invalida todo o cache de experiências.
 */
export function forceRefresh(): void {
  cache.clear();
}
