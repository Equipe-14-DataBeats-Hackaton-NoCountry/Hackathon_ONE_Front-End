/**
 * ChurnInsight API Service
 *
 * Provides a centralized interface for all API communications with the
 * ChurnInsight backend. Handles authentication, error handling, and
 * request/response transformations.
 *
 * @module services/api
 * @version 1.0.0
 * @author ChurnInsight Team
 */

// =============================================================================
// Configuration
// =============================================================================

const isProduction = import.meta.env.PROD;

/**
 * API configuration object.
 * In production, uses nginx proxy; in development, connects directly to backend.
 * @constant {Object}
 */
const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || '/api',
  username: import.meta.env.VITE_API_USERNAME,
  password: import.meta.env.VITE_API_PASSWORD,
};

// Runtime credentials (can be seeded from env, or collected at runtime)
const runtimeCredentials = {
  username: API_CONFIG.username || null,
  password: API_CONFIG.password || null,
};

/**
 * Ensure we have credentials available. If not present from env, try sessionStorage,
 * otherwise prompt the user once (kept only for the browser session).
 */
const ensureCredentials = () => {
  if (runtimeCredentials.username && runtimeCredentials.password) return;

  // Try to restore from sessionStorage (avoids prompting on every reload during a session)
  try {
    const stored = sessionStorage.getItem('churn_api_creds');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.username && parsed.password) {
        runtimeCredentials.username = parsed.username;
        runtimeCredentials.password = parsed.password;
        return;
      }
    }
  } catch (e) {
    // ignore sessionStorage errors
  }

  // As a last resort, prompt the user (format: username:password). This is intended for
  // development / tunnel usage only. Credentials are kept in sessionStorage for convenience.
  // We avoid using persistent storage for security reasons.
  // Use a single prompt to simplify UX; user can cancel to abort.
  if (typeof window !== 'undefined' && typeof prompt === 'function') {
    const input = prompt('Informe suas credenciais para a API no formato username:password (válido apenas nesta sessão):');
    if (!input) {
      throw new Error('Credenciais da API não fornecidas');
    }
    const idx = input.indexOf(':');
    if (idx <= 0) {
      throw new Error('Formato inválido. Use username:password');
    }
    runtimeCredentials.username = input.slice(0, idx);
    runtimeCredentials.password = input.slice(idx + 1);

    try {
      sessionStorage.setItem('churn_api_creds', JSON.stringify({
        username: runtimeCredentials.username,
        password: runtimeCredentials.password,
      }));
    } catch (e) {
      // ignore storage errors
    }

    return;
  }

  throw new Error('Sem credenciais disponíveis para a API');
};

// =============================================================================
// Internal Utilities
// =============================================================================

/**
 * Generates HTTP Basic Authentication header.
 * @private
 * @returns {string} Base64 encoded credentials
 */
const getAuthHeader = () => {
  // Ensure we have credentials from env or runtime prompt
  if (!runtimeCredentials.username || !runtimeCredentials.password) {
    ensureCredentials();
  }

  const credentials = btoa(`${runtimeCredentials.username}:${runtimeCredentials.password}`);
  return `Basic ${credentials}`;
};

/**
 * Executes an authenticated HTTP request with error handling.
 * @private
 * @param {string} endpoint - API endpoint path
 * @param {Object} [options={}] - Fetch options
 * @returns {Promise<Object>} Parsed JSON response
 * @throws {Error} When request fails or returns non-2xx status
 */
const fetchWithAuth = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    // explicit CORS mode for tunneled origins, and include credentials if cookies are used
    mode: 'cors',
    // credentials: 'include', // uncomment if you rely on cookies
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    // Try to parse a JSON error body, otherwise return raw text to aid debugging
    let errorBody;
    try {
      errorBody = await response.json();
    } catch (e) {
      try {
        const text = await response.text();
        errorBody = { message: text };
      } catch (t) {
        errorBody = { message: 'Unknown error' };
      }
    }

    const message = (errorBody && (errorBody.message || errorBody.error || JSON.stringify(errorBody))) || `HTTP ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    err.body = errorBody;
    throw err;
  }

  // Try to parse JSON, but tolerate empty responses
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
};

// =============================================================================
// Client Search Endpoints
// =============================================================================

/**
 * Performs paginated search for clients with optional filters.
 * @param {Object} [params={}] - Search parameters
 * @param {number} [params.page=0] - Page number (0-indexed)
 * @param {number} [params.size=10] - Page size
 * @param {string} [params.status] - Filter by churn status (WILL_CHURN/WILL_STAY)
 * @param {string} [params.gender] - Filter by gender
 * @param {number} [params.minAge] - Minimum age filter
 * @param {number} [params.maxAge] - Maximum age filter
 * @returns {Promise<Object>} Paginated response with client data
 */
export const searchClients = async (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  });

  const queryString = searchParams.toString();
  return fetchWithAuth(queryString ? `/clients?${queryString}` : '/clients');
};

/**
 * Retrieves available filter options for client search.
 * @returns {Promise<Object>} Available filter values with counts
 */
export const getFilterOptions = async () => {
  try {
    return await fetchWithAuth('/clients/filter-options');
  } catch (err) {
    // Fallback to public stats endpoint (less granular) or local static
    try {
      const res = await fetch('/public/clients/statistics');
      if (res.ok) return res.json();
    } catch (e) { /* ignore */ }
    throw err;
  }
};

/**
 * Provides autocomplete suggestions for user ID search.
 * @param {string} prefix - Search prefix (minimum 2 characters)
 * @returns {Promise<string[]>} Matching user IDs
 */
export const autocompleteUserId = async (prefix) => {
  return fetchWithAuth(`/clients/autocomplete/user-id?prefix=${encodeURIComponent(prefix)}`);
};

/**
 * Retrieves clients filtered by churn status.
 * @param {string} status - Churn status (WILL_CHURN/WILL_STAY)
 * @param {number} [page=0] - Page number
 * @param {number} [size=10] - Page size
 * @returns {Promise<Object>} Paginated client list
 */
export const getClientsByStatus = async (status, page = 0, size = 10) => {
  return fetchWithAuth(`/clients/by-status/${status}?page=${page}&size=${size}`);
};

/**
 * Retorna todos os clientes (com paginação).
 */
export const getAllClients = async (page = 0, size = 1000) => {
  // Primeiro tenta o endpoint autenticado (se as credenciais estiverem configuradas)
  try {
    return await fetchWithAuth(`/clients?page=${page}&size=${size}`);
  } catch (err) {
    // Se falhar (401/403 ou erro de rede), tentamos o endpoint público de amostra
    try {
      const publicRes = await fetch(`/public/clients/list?page=${page}&size=${size}`);
      if (publicRes.ok) return publicRes.json();
    } catch (e) {
      // ignore here, iremos propagar o erro original abaixo
    }

    // Repropaga o erro original para o caller tratar/fallbacks adicionais
    throw err;
  }
};

/**
 * Retorna estatísticas agregadas (Probabilidades, etc).
 */
export const getStatistics = async () => {
  try {
    return await fetchWithAuth('/clients/statistics');
  } catch (err) {
    // Fallback to public unauthenticated endpoint
    const res = await fetch('/public/clients/statistics');
    if (!res.ok) throw err;
    return res.json();
  }
};

/**
 * NOVO: Retorna a contagem total de clientes.
 * Necessário pois o backend separou isso do endpoint de estatísticas.
 */
export const getTotalCount = async () => {
  try {
    return await fetchWithAuth('/clients/count');
  } catch (err) {
    const res = await fetch('/public/clients/count');
    if (!res.ok) throw err;
    return res.json();
  }
};

/**
 * Retorna métricas consolidadas do dashboard.
 * Endpoint: /dashboard/metrics
 */
export const getDashboardMetrics = async () => {
  return fetchWithAuth('/dashboard/metrics');
};



/**
 * Retrieves high-risk clients (churn probability > 70%).
 * @param {number} [page=0] - Page number
 * @param {number} [size=10] - Page size
 * @returns {Promise<Object>} Paginated high-risk client list
 */
export const getHighRiskClients = async (page = 0, size = 10) => {
  try {
    return await fetchWithAuth(`/clients/high-risk?page=${page}&size=${size}`);
  } catch (err) {
    // No public high-risk list available; bubble up the error so UI falls back to local data if configured
    throw err;
  }
};

// =============================================================================
// Prediction Endpoints
// =============================================================================

/**
 * Performs individual churn prediction for a customer profile.
 * @param {Object} customerProfile - Customer data for prediction
 * @param {string} customerProfile.user_id - Unique customer identifier
 * @param {string} customerProfile.gender - Customer gender
 * @param {number} customerProfile.age - Customer age
 * @param {string} customerProfile.country - ISO country code
 * @param {string} customerProfile.subscription_type - Subscription plan
 * @param {number} customerProfile.listening_time - Monthly listening minutes
 * @param {number} customerProfile.songs_played_per_day - Daily song count
 * @param {number} customerProfile.skip_rate - Song skip rate (0-1)
 * @param {number} customerProfile.ads_listened_per_week - Weekly ad count
 * @param {string} customerProfile.device_type - Primary device
 * @param {boolean} customerProfile.offline_listening - Uses offline feature
 * @returns {Promise<Object>} Prediction result with probability and diagnosis
 */
export const predictChurn = async (customerProfile) => {
  return fetchWithAuth('/predict', {
    method: 'POST',
    body: JSON.stringify(customerProfile),
  });
};

/**
 * Retrieves detailed prediction statistics for a customer profile.
 * @param {Object} customerProfile - Customer data for prediction
 * @returns {Promise<Object>} Detailed statistics including class probabilities
 */
export const getStats = async (customerProfile) => {
  return fetchWithAuth('/stats', {
    method: 'POST',
    body: JSON.stringify(customerProfile),
  });
};

/**
 * Uploads a file for batch churn prediction processing.
 * @param {File} file - CSV or XLSX file with customer profiles
 * @returns {Promise<Object>} Job information including job_id for status tracking
 */
export const uploadBatchFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_CONFIG.baseUrl}/predict/batch`, {
    method: 'POST',
    headers: { 'Authorization': getAuthHeader() },
    body: formData,
  });

  if (!response.ok) {
    let errorBody;
    try {
      errorBody = await response.json();
    } catch (e) {
      try {
        const text = await response.text();
        errorBody = { message: text };
      } catch (t) {
        errorBody = { message: 'Upload failed' };
      }
    }

    throw new Error(errorBody.message || `HTTP ${response.status}`);
  }

  return response.json();
};

/**
 * Checks the status of a batch processing job.
 * @param {string} jobId - Job identifier from uploadBatchFile response
 * @returns {Promise<Object>} Job status including progress and results
 */
export const getBatchStatus = async (jobId) => fetchWithAuth(`/predict/batch/status/${jobId}`);

// =============================================================================
// System Endpoints
// =============================================================================

/**
 * Performs API health check.
 * @returns {Promise<Object>} Health status information
 */
export const healthCheck = async () => fetchWithAuth('/health');

/**
 * Clears the prediction cache (requires ADMIN role).
 * @returns {Promise<Object>} Cache clear confirmation
 */
export const clearCache = async () => fetchWithAuth('/cache/clear', { method: 'POST' });

/**
 * Retrieves aggregate statistics for clients.
 * @returns {Promise<Object>} Aggregate statistics including total count and average probability
 */
export const getAggregates = async () => {
  try {
    return await fetchWithAuth('/clients/aggregates');
  } catch (err) {
    // Fallback: try unauthenticated public endpoint
    try {
      const res = await fetch('/public/clients/statistics');
      if (res.ok) {
        const data = await res.json();
        // map public stats to aggregates minimal shape
        return {
          total: data.total_predictions || data.total || data.total_predictions || 0,
          averageProbability: data.churn_rate || data.averageChurnProbability || 0,
          totalChurners: data.total_churners || data.total_churners || 0,
          churnRate: data.churn_rate || 0,
          probabilityBuckets: [0, 0, 0, 0],
          riskFactorCounts: {}
        };
      }
    } catch (e) { /* ignore */ }
    throw err;
  }
};

// =============================================================================
// Module Exports
// =============================================================================

export default {
  searchClients,
  getFilterOptions,
  autocompleteUserId,
  getClientsByStatus,
  getAllClients,
  getTotalCount,
  getStatistics,
  getHighRiskClients,
  predictChurn,
  getStats,
  uploadBatchFile,
  getBatchStatus,
  healthCheck,
  clearCache,
  API_CONFIG,
  getAggregates,
  getDashboardMetrics
};
