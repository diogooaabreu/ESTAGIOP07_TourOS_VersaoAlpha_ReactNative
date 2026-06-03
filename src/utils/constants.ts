// ============================================================
// TourOS POS — Constantes da aplicação
// ============================================================

/** URL base da API TourOS (substituir pela real em produção) */
export const BASE_URL = 'http://localhost:8000/api';

/** IDs dos tours activos no sistema TourOS */
export const ACTIVE_TOUR_IDS = [1, 2, 3, 4, 5];

/** Tempo de cache padrão (5 minutos em ms) */
export const CACHE_TTL_MS = 5 * 60 * 1000;

/** Timeout de bloqueio por inactividade do PIN (5 minutos em ms) */
export const PIN_TIMEOUT_MS = 5 * 60 * 1000;

/** Nome da base de dados SQLite local */
export const DB_NAME = 'tourpos.db';

/** Lista de balcões disponíveis */
export const BALCOES = [
  'Albufeira',
  'Faro',
  'Portimão',
  'Lagos',
  'Tavira',
  'Vilamoura',
  'Online',
] as const;

export type Balcao = (typeof BALCOES)[number];
