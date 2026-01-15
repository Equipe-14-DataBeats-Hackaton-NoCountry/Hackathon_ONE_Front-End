import React from 'react';

export function ClientExplainability({ client }) {
  if (!client) return null;

  // -----------------------------
  // Helpers
  // -----------------------------
  const safeNumber = (v, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  // Probability can arrive in different keys depending on the API shape
  const rawProb =
    client.probability ??
    client.churnProbability ??
    client.churn_probability ??
    client.probabilidade ??
    0;

  const prob = Math.min(Math.max(safeNumber(rawProb, 0), 0), 1);
  const percent = (prob * 100).toFixed(1) + '%';

   // -----------------------------
  // Risk level (alinhado com o back-end)
  // 0–40%  -> Low
  // 40–60% -> Moderate
  // 60–100%-> High
  // -----------------------------
  const getRiskLevel = (p) => {
    if (p < 0.4) return 'LOW';
    if (p < 0.6) return 'MODERATE';
    return 'HIGH';
  };

  const riskLevel = getRiskLevel(prob);

  const riskMeta = {
    LOW: {
      label: 'Baixo Risco de Cancelamento',
      badge: 'BAIXO RISCO',
      range: '0–40% → Baixo Risco',
      color: '#1DB954',
      softBg: '#1DB95420',
      border: '#1DB954',
    },
    MODERATE: {
      label: 'Risco Moderado de Cancelamento',
      badge: 'RISCO MODERADO',
      range: '40–60% → Risco Moderado',
      color: '#ffcc00',
      softBg: '#ffcc0020',
      border: '#ffcc00',
    },
    HIGH: {
      label: 'Alto Risco de Cancelamento',
      badge: 'ALTO RISCO',
      range: '60–100% → Alto Risco',
      color: '#ff4d4d',
      softBg: '#ff4d4d20',
      border: '#ff4d4d',
    },
  }[riskLevel];

  // -----------------------------
  // Translation map (same idea you already use across the project)
  // -----------------------------
  const traducao = {
    gender: 'Gênero',
    gender_Male: 'Gênero Masculino',
    gender_Female: 'Gênero Feminino',
    age: 'Idade',
    Age: 'Idade',
    country: 'País',
    country_FR: 'País França',
    country_IN: 'País Índia',
    subscription_type: 'Tipo de Assinatura',
    subscription_type_Student: 'Assinatura Estudante',
    listening_time: 'Tempo de Escuta',
    songs_played_per_day: 'Músicas por Dia',
    skip_rate: 'Taxa de Pulagem',
    device_type: 'Tipo de Dispositivo',
    ads_listened_per_week: 'Anúncios por Semana',
    offline_listening: 'Uso Offline',
    is_churned: 'Cancelamento (Churn)',
    songs_per_minute: 'Músicas por Minuto',
    ad_intensity: 'Intensidade de Anúncios',
    frustration_index: 'Índice de Frustração',
    is_heavy_user: 'Usuário Intenso (Heavy)',
    premium_no_offline: 'Premium sem Offline',
    premium_sub_month: 'Meses de Assinatura Premium',
    fav_genre: 'Gênero Favorito',
  };

  const traduzir = (termo) => {
    if (!termo || termo === 'N/A') return 'N/A';
    const termoLimpo = String(termo).replace(/^num__/, '').replace(/^cat__/, '');
    return traducao[termoLimpo] || termoLimpo;
  };

  // -----------------------------
  // Risk / Retention factors (safe & consistent)
  // -----------------------------
  const rawRiskFactor =
    client.primary_risk_factor ||
    client.primaryRiskFactor ||
    client.main_factor ||
    client.fator_risco ||
    '';

  // If overall is LOW, don't show a "moderate" risk factor (it confuses the narrative)
  const riskFactor =
    riskLevel === 'LOW'
      ? 'Nenhum fator de risco relevante identificado'
      : (traduzir(rawRiskFactor) || 'Perfil de Risco Moderado');

  const rawRetention =
    client.primary_retention_factor ||
    client.primaryRetentionFactor ||
    client.secondary_factor ||
    client.secondaryFactor ||
    client.retention_factor ||
    '';

  const retentionFactor =
    rawRetention && rawRetention !== 'N/A'
      ? traduzir(rawRetention)
      : 'Nenhum fator relevante identificado';

  // Color for the "Fator de Risco" line should follow the risk level (not always red)
  const riskFactorColor =
    riskLevel === 'HIGH' ? '#ff4d4d' : riskLevel === 'MODERATE' ? '#ffcc00' : '#1DB954';

  // Badge style
  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '0.72rem',
    fontWeight: '800',
    letterSpacing: '0.3px',
    background: riskMeta.softBg,
    color: riskMeta.color,
    border: `1px solid ${riskMeta.color}`,
    lineHeight: 1,
  };

  // Range pill style
  const rangeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '0.78rem',
    fontWeight: '700',
    background: 'transparent',
    color: '#fff',
    border: `1px solid ${riskMeta.color}`,
    width: 'fit-content',
    marginTop: '10px',
  };

  return (
    <div
      className="card"
      style={{
        background: '#181818',
        padding: '25px',
        borderRadius: '8px',
        borderLeft: `5px solid ${riskMeta.border}`,
        width: '100%',
      }}
    >
      {/* Header: separated for readability */}
      <div style={{ marginBottom: '18px' }}>
        <h3 style={{ color: riskMeta.color, margin: 0, marginBottom: '6px' }}>
          Diagnóstico
        </h3>
        <div style={{ color: '#b3b3b3', fontSize: '0.85rem' }}>
          ID do Cliente:{' '}
          <span style={{ color: '#fff', fontWeight: 'bold' }}>
            {client.clientId || client.userId || client.user_id || 'Cliente'}
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'start',
        }}
      >
        {/* Left column: probability + range */}
        <div>
          <p style={{ color: '#b3b3b3', marginBottom: '10px' }}>
            <strong>Probabilidade de Churn:</strong>
          </p>

          <h2 style={{ fontSize: '1.9rem', margin: 0, color: riskMeta.color }}>
            {percent}
          </h2>

          <div style={rangeStyle}>{riskMeta.range}</div>
        </div>

        {/* Right column: status + badge + factors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <p style={{ margin: 0 }}>
              <strong>Status:</strong>
              <span
                style={{
                  marginLeft: '8px',
                  color: riskMeta.color,
                  fontWeight: 'bold',
                }}
              >
                {riskMeta.label}
              </span>
            </p>
            <span style={badgeStyle}>{riskMeta.badge}</span>
          </div>

          <p style={{ margin: 0 }}>
            <strong>Fator de Risco:</strong>
            <span style={{ color: riskFactorColor, marginLeft: '8px', fontWeight: 700 }}>
              {riskFactor}
            </span>
          </p>

          <p style={{ margin: 0 }}>
            <strong>Fator de Retenção:</strong>
            <span style={{ color: '#1DB954', marginLeft: '8px' }}>
              {retentionFactor}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}