// ============================================================
// TourOS POS — Cliente HTTP Axios
// ============================================================

import axios, { AxiosError, type AxiosInstance } from 'axios';

const BASE_URL = 'https://release.touros.app';
const TIMEOUT_MS = 30_000; // 30 segundos

/**
 * Instância Axios pré-configurada para comunicar com a API TourOS.
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ── Interceptor de Request (logging em dev) ──────────────────────────────

apiClient.interceptors.request.use(
  config => {
    if (__DEV__) {
      console.log(
        `[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
        config.params ?? '',
      );
    }
    return config;
  },
  error => {
    if (__DEV__) {
      console.error('[API] Request error:', error.message);
    }
    return Promise.reject(error);
  },
);

// ── Interceptor de Response (normalização de erros) ──────────────────────

apiClient.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    if (__DEV__) {
      console.error('[API] Response error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    // Normalizar a mensagem de erro para a app
    let message = 'Erro de ligação ao servidor. Tente novamente.';

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;

      if (status === 404) {
        message = 'Recurso não encontrado.';
      } else if (status === 422) {
        // Erro de validação — extrair primeira mensagem
        if (data?.message) {
          message = data.message;
        } else if (data?.errors) {
          const firstField = Object.values(data.errors)[0] as string[];
          message = firstField?.[0] ?? 'Dados inválidos.';
        }
      } else if (status === 429) {
        message = 'Muitos pedidos. Aguarde um momento.';
      } else if (status >= 500) {
        message = 'Erro interno do servidor. Tente mais tarde.';
      } else if (data?.message) {
        message = data.message;
      }
    } else if (error.code === 'ECONNABORTED') {
      message = 'O pedido excedeu o tempo limite. Verifique a sua ligação.';
    } else if (error.message === 'Network Error') {
      message = 'Sem ligação à internet.';
    }

    return Promise.reject({
      message,
      status: error.response?.status,
      original: error,
    });
  },
);

export default apiClient;
