import { useState, useEffect } from "react";
import { healthCheck, getDashboardMetrics } from "../services/api";

// Normaliza do payload do /dashboard/metrics (snake_case) para o formato do front
const normalizeDashboardMetrics = (data) => {
  if (!data) return null;

  const total = Number(data.total_customers ?? 0);

  const churnRate = Number(data.global_churn_rate ?? 0); // já vem em %
  const atRisk = Number(data.customers_at_risk ?? 0);
  const revenue = Number(data.revenue_at_risk ?? 0);

  // model_accuracy vem 0..1
  const accuracyPct = data.model_accuracy == null ? 0 : Number(data.model_accuracy) * 100;

  // churn_distribution vem [willStay, willChurn]
  const dist = Array.isArray(data.churn_distribution) ? data.churn_distribution : [0, 0];

  // feature_importance vem [] por enquanto; manter array
  const featureImportance = Array.isArray(data.feature_importance) ? data.feature_importance : [];

  return {
    totalClients: total,
    globalChurnRate: churnRate.toFixed(1),     // string "25.0"
    highRiskCount: atRisk,
    revenueAtRisk: revenue,
    modelAccuracy: accuracyPct.toFixed(1),     // string "64.9"
    churnDistribution: dist,                   // [stay, churn]
    featureImportance: featureImportance,      // array
    // se quiser já suportar risk_factors no front depois:
    riskFactors: Array.isArray(data.risk_factors) ? data.risk_factors : [],
  };
};

export function useData() {
  const [metrics, setMetrics] = useState(null);
  const [apiStatus, setApiStatus] = useState("checking");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1) Health check: ONLINE só se status === "UP"
      let isOnline = false;
      try {
        const health = await healthCheck();
        isOnline = health?.status === "UP";
        setApiStatus(isOnline ? "online" : "degraded");
      } catch {
        setApiStatus("offline");
        isOnline = false;
      }

      // Se não estiver ONLINE: não exibe nada
      if (!isOnline) {
        setMetrics(null);
        return;
      }

      // 2) Busca o que realmente alimenta cards + gráficos
      const dashboard = await getDashboardMetrics();
      const normalized = normalizeDashboardMetrics(dashboard);

      setMetrics(normalized);
    } catch (err) {
      console.error("❌ Erro useData:", err);
      setError(err?.message || "Erro ao carregar métricas");
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { metrics, apiStatus, loading, error, refresh: fetchData };
}