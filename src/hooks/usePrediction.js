import { useState, useCallback } from 'react';
import { predictChurn, getStats, uploadBatchFile, getBatchStatus } from '../services/api';

/**
 * Hook customizado para gerenciar predições de churn.
 *
 * Encapsula a lógica de requisição à API, tratamento de erros e estados.
 * Fornece dois tipos de predição:
 *
 * @returns {Object} Objeto com métodos e estados:
 *   - predict(profile): Realiza predição (persiste no histórico)
 *   - getFullStats(profile): Retorna estatísticas detalhadas
 *   - reset(): Limpa estado
 *   - loading: boolean indicando requisição em andamento
 *   - error: string com mensagem de erro ou null
 *   - result: resultado da última predição ou null
 *
 * @example
 * const { predict, loading, error, result } = usePrediction();
 * await predict({ user_id: 'usr_123', age: 25, ... });
 */
export function usePrediction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  /**
   * Executa predição de churn.
   * Persiste resultado no histórico de predições.
   *
   * @param {Object} customerProfile Dados do cliente validados
   * @returns {Promise<Object>} Resultado com prediction, probability, ai_diagnosis
   */
  const predict = useCallback(async (customerProfile) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await predictChurn(customerProfile);
      setResult(response);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Executa predição retornando estatísticas completas.
   * Não persiste no histórico.
   *
   * @param {Object} customerProfile Dados do cliente validados
   * @returns {Promise<Object>} Resultado com probabilities e class_probabilities
   */
  const getFullStats = useCallback(async (customerProfile) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getStats(customerProfile);
      setResult(response);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Limpa todos os estados (resultado, erro, loading).
   */
  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    predict,
    getFullStats,
    reset,
    loading,
    error,
    result,
  };
}

/**
 * Hook customizado para gerenciar processamento em lote.
 *
 * Responsabilidades:
 * - Upload de arquivo CSV/XLSX
 * - Polling automático de status
 * - Gestão de estado do job
 *
 * @returns {Object} Objeto com métodos e estados:
 *   - uploadFile(file): Inicia novo job de processamento
 *   - checkStatus(jobId?): Consulta status manual
 *   - startPolling(intervalMs): Inicia polling automático
 *   - reset(): Limpa estado do job
 *   - loading, error: Estados de requisição
 *   - jobId: ID do job em progresso
 *   - status: Status atual do job
 *   - polling: boolean indicando polling ativo
 *
 * @example
 * const { uploadFile, status, polling } = useBatchProcessing();
 * await uploadFile(csvFile);
 * // Polling inicia automaticamente em useEffect
 */
export function useBatchProcessing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const [polling, setPolling] = useState(false);

  /**
   * Envia arquivo para processamento em lote.
   * Retorna jobId para rastreamento.
   *
   * @param {File} file Arquivo CSV ou XLSX
   * @returns {Promise<Object>} Response contendo job_id
   * @throws {Error} Se arquivo inválido ou muito grande
   */
  const uploadFile = useCallback(async (file) => {
    setLoading(true);
    setError(null);
    setJobId(null);
    setStatus(null);

    try {
      const response = await uploadBatchFile(file);
      setJobId(response.job_id);
      setStatus(response);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Consulta status manual de um job.
   *
   * @param {string} id jobId (usa jobId do estado se não fornecido)
   * @returns {Promise<Object>} Status atual do job
   */
  const checkStatus = useCallback(async (id = jobId) => {
    if (!id) {
      setError('Job ID não encontrado');
      return null;
    }

    try {
      const response = await getBatchStatus(id);
      setStatus(response);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [jobId]);

  /**
   * Inicia polling automático para monitorar progresso do job.
   * Para automaticamente quando job termina (COMPLETED/FAILED).
   *
   * @param {number} intervalMs Intervalo entre requisições (ms)
   * @returns {Function} Função para parar o polling manualmente
   */
  const startPolling = useCallback((intervalMs = 2000) => {
    if (!jobId) return;

    setPolling(true);

    const pollInterval = setInterval(async () => {
      try {
        const response = await getBatchStatus(jobId);
        setStatus(response);

        // Para o polling quando terminar
        if (response.status === 'COMPLETED' || response.status === 'FAILED') {
          clearInterval(pollInterval);
          setPolling(false);
        }
      } catch (err) {
        console.error('Erro no polling:', err);
        clearInterval(pollInterval);
        setPolling(false);
      }
    }, intervalMs);

    return () => {
      clearInterval(pollInterval);
      setPolling(false);
    };
  }, [jobId]);
  

  /**
   * Limpa todo o estado do job (jobId, status, error).
   */
  const reset = useCallback(() => {
    setJobId(null);
    setStatus(null);
    setError(null);
    setPolling(false);
  }, []);

  return {
    uploadFile,
    checkStatus,
    startPolling,
    reset,
    loading,
    error,
    jobId,
    status,
    polling,
  };
}

