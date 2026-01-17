/**
 * Componente de formulário para predição individual de churn.
 *
 * Responsabilidades:
 * - Capturar dados demográficos e comportamentais do cliente
 * - Sanitizar e converter tipos de dados antes do envio à API
 * - Chamar API de predição via hook usePrediction
 * - Exibir resultado com layout visual estilo Dashboard (Dark Mode)
 *
 * Correções aplicadas:
 * - Conversão explícita de tipos numéricos no envio (fix Postman vs Frontend)
 * - Tratamento de valores vazios/NaN
 * - Validação obrigatória de user_id no frontend (evita HTTP 400)
 * - FIX CRÍTICO: Lógica de classificação de risco corrigida
 * - FIX: Removida variável 'response' inexistente
 *
 * @component
 * @returns {JSX.Element} Formulário interativo com visualização de risco
 */

import { useState, useRef } from 'react';
import { usePrediction } from '../hooks/usePrediction';
import { Zap } from 'lucide-react';

// --- ESTILOS (Dark Theme Spotify) ---
const inputStyle = {
  padding: '12px',
  background: '#181818',
  color: 'white',
  border: '1px solid #333',
  borderRadius: '4px',
  width: '100%',
  fontSize: '0.95rem',
};

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  color: '#b3b3b3',
  fontSize: '0.85rem',
};

const buttonStyle = {
  padding: '14px 28px',
  background: '#1DB954',
  color: '#000',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '1rem',
  transition: 'all 0.2s ease',
  marginTop: '20px',
  width: '100%',
};

export function PredictionForm() {
  const { predict, loading, error, result, reset } = usePrediction();

  const idInputRef = useRef(null);

  // Erro de validação do formulário (ex: user_id vazio)
  const [formError, setFormError] = useState(null);

  // Estado do formulário inicializado com valores padrão
  const [formData, setFormData] = useState({
    user_id: "",
    gender: "Male",
    age: 25,
    country: "BR",
    subscription_type: "Free",
    device_type: "Mobile",
    listening_time: 300,
    songs_played_per_day: 20,
    skip_rate: 0.2,
    ads_listened_per_week: 10,
    offline_listening: false,
  });

  // estilo do input do ID depende do formError, então precisa vir depois
  const idInputStyle = {
    ...inputStyle,
    border: formError ? '1px solid #ff4d4d' : inputStyle.border,
  };

  /**
   * Handler para mudanças em campos do formulário.
   * Mantém os valores como string durante a digitação para melhor UX,
   * a conversão para número ocorre apenas no submit.
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'user_id') {
      // Qualquer interação que altere o ID invalida o resultado anterior
      if (result || error) reset();

      // Se existe erro local, some assim que o usuário mexer no campo
      if (formError) setFormError(null);
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  /**
   * Submete formulário para predição na API.
   * Realiza sanitização rigorosa dos dados para garantir compatibilidade com o Backend.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Validação obrigatória do user_id (evita HTTP 400)
    const userId = (formData.user_id || "").trim();
    if (!userId) {
      reset(); // limpa resultado e erro da predição anterior
      setFormError("Informe o ID do Usuário para realizar a predição.");
      requestAnimationFrame(() => idInputRef.current?.focus());
      return;
    }

    const payload = {
      ...formData,
      user_id: userId,
      age: Number(formData.age) || 0,
      listening_time: Number(formData.listening_time) || 0,
      songs_played_per_day: Number(formData.songs_played_per_day) || 0,
      skip_rate: Number(formData.skip_rate) || 0,
      ads_listened_per_week: Number(formData.ads_listened_per_week) || 0,
      offline_listening: !!formData.offline_listening,
    };

    console.log("📤 Payload Sanitizado:", JSON.stringify(payload, null, 2));

    try {
      const apiResult = await predict(payload);
      console.log("📥 Resultado da API:", apiResult);
    } catch (err) {
      console.error("❌ Erro na predição:", err);
    }
  };

  // =========================================================
  //  LÓGICA DE APRESENTAÇÃO (VISUAL DASHBOARD)
  // =========================================================

  // Função auxiliar para traduzir termos técnicos
  const traduzir = (texto) => {
    if (!texto) return 'Desconhecido';
    const mapa = {
      'listening_time': 'Tempo de Escuta',
      'skip_rate': 'Taxa de Pulos',
      'songs_played_per_day': 'Músicas Diárias',
      'ads_listened_per_week': 'Anúncios por Semana',
      'age': 'Idade',
      'subscription_type': 'Tipo de Assinatura',
      'offline_listening': 'Uso Offline'
    };
    return mapa[texto] || texto.replace(/_/g, ' ');
  };

  // Alguns backends retornam 'churn_probability' ou 'probability'
  const rawProbability =
    result?.probability !== undefined
      ? result.probability
      : (result?.churn_probability || 0);

  // clamp apenas pro UI não cravar 100%
  const percentual = Math.min(rawProbability * 100, 99.9).toFixed(1) + '%';

  // =========================================================
  //  CORES E NÍVEIS DE RISCO (Baixo / Moderado / Alto)
  //  Fonte de verdade: faixas do produto (0-40 / 40-60 / 60-100)
  //  FIX: Corrigida a lógica de classificação
  // =========================================================

  const STATUS_LOW = 'Baixo Risco de Cancelamento';
  const STATUS_MOD = 'Risco Moderado de Cancelamento';
  const STATUS_HIGH = 'Alto Risco de Cancelamento';

  // Faixas do produto (definidas pelo backend) - REGRA DE NEGÓCIO
  // 0-40% = Baixo | 40-60% = Moderado | 60-100% = Alto
  const LOW_MAX = 0.40;   // 0% - 40%
  const MOD_MIN = 0.40;   // 40% - 60%
  const MOD_MAX = 0.60;   
  const HIGH_MIN = 0.60;  // 60% - 100%

  const riskPalette = {
    low: { color: '#1DB954', bg: '#1DB95420', border: '#1DB954' },   // verde
    mod: { color: '#f1c40f', bg: '#f1c40f20', border: '#f1c40f' },   // amarelo
    high: { color: '#ff4d4d', bg: '#ff4d4d20', border: '#ff4d4d' },  // vermelho
    unknown: { color: '#b3b3b3', bg: '#b3b3b320', border: '#333' }
  };

  // risk_level da API (se existir) - aceitando formatos comuns
  const apiRiskLevelRaw = result?.risk_level;
  const apiRiskLevel = typeof apiRiskLevelRaw === 'string'
    ? apiRiskLevelRaw.toLowerCase()
    : null;

  // Determinação do riskLevel:
  // 1) se API mandar semanticamente, usa
  // 2) senão, usa probabilidade nas faixas do produto
  let riskLevel = 'unknown';

  if (apiRiskLevel) {
    if (apiRiskLevel.includes('low') || apiRiskLevel.includes('baixo')) {
      riskLevel = 'low';
    } else if (apiRiskLevel.includes('mod') || apiRiskLevel.includes('moder')) {
      riskLevel = 'mod';
    } else if (apiRiskLevel.includes('high') || apiRiskLevel.includes('alto')) {
      riskLevel = 'high';
    }
  } else {
    // FIX CRÍTICO: Lógica corrigida usando a probabilidade bruta (0-1)
    const p = rawProbability; // 0..1
    
    if (p < LOW_MAX) {
      riskLevel = 'low';     // 0 - 0.399... = baixo
    } else if (p < MOD_MAX) {
      riskLevel = 'mod';     // 0.40 - 0.599... = moderado
    } else {
      riskLevel = 'high';    // 0.60+ = alto
    }
    
    // Debug log para verificar classificação
    console.log(`🎯 Classificação: ${(p * 100).toFixed(1)}% → ${riskLevel.toUpperCase()}`);
  }

  // Status label padronizado (não depende do texto vindo da API)
  const statusLabel =
    riskLevel === 'low' ? STATUS_LOW :
    riskLevel === 'mod' ? STATUS_MOD :
    riskLevel === 'high' ? STATUS_HIGH :
    'Risco Indefinido';

  const statusColor = riskPalette[riskLevel].color;
  const statusBorderColor = riskPalette[riskLevel].border;
  const statusBg = riskPalette[riskLevel].bg;

  // Badge label
  const badgeText =
    riskLevel === 'low' ? 'BAIXO RISCO' :
    riskLevel === 'mod' ? 'RISCO MODERADO' :
    riskLevel === 'high' ? 'ALTO RISCO' :
    'INDEFINIDO';

  // Faixa interpretativa abaixo da probabilidade
  const faixaInterpretativa = riskLevel === 'low'
    ? `0–${Math.round(LOW_MAX * 100)}% → Baixo Risco`
    : riskLevel === 'mod'
      ? `${Math.round(MOD_MIN * 100)}–${Math.round(MOD_MAX * 100)}% → Risco Moderado`
      : riskLevel === 'high'
        ? `${Math.round(HIGH_MIN * 100)}–100% → Alto Risco`
        : 'Faixa não disponível';

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: '800',
    letterSpacing: '0.5px',
    color: '#000',
    background: statusColor,
    border: `1px solid ${statusBorderColor}`,
    textTransform: 'uppercase',
    lineHeight: '1',
  };

  // Acesso seguro ao diagnóstico da IA
  const diagnosis = result?.ai_diagnosis || {};

  // =========================================================
  //  FATOR DE RISCO / RETENÇÃO (mantém sua regra de não alarmar baixo risco)
  // =========================================================

  const rawRiskFactor = result?.primary_risk_factor || diagnosis.primary_risk_factor;

  const hasRiskFactorFromApi = !!rawRiskFactor;
  const showRiskFactorFromApi = (riskLevel === 'mod' || riskLevel === 'high') && hasRiskFactorFromApi;

  const riskFactor = showRiskFactorFromApi
    ? traduzir(rawRiskFactor)
    : 'Nenhum fator de risco relevante identificado';

  const riskFactorColor =
    riskLevel === 'high' ? riskPalette.high.color :
    riskLevel === 'mod' ? riskPalette.mod.color :
    '#b3b3b3';

  const rawRetentionFactor = diagnosis.primary_retention_factor;
  const retentionFactor = rawRetentionFactor
    ? traduzir(rawRetentionFactor)
    : (formData.offline_listening ? 'Uso Offline' : 'Nenhum fator relevante identificado');

  const suggestedAction = result?.recommended_action || diagnosis.suggested_action;

  return (
    <div style={{ background: '#242424', padding: '30px', borderRadius: '8px', borderLeft: '5px solid #1DB954' }}>
      <h3 style={{ marginBottom: '25px', fontSize: '1.25rem' }}>🔮 Predição Individual de Churn</h3>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '25px' }}>

          {/* User ID */}
          <div>
            <label style={labelStyle}>
              ID do Usuário <span style={{ color: '#ff4d4d' }}>*</span>
            </label>
            <input
              type="text"
              name="user_id"
              ref={idInputRef}
              value={formData.user_id}
              onChange={handleChange}
              placeholder="Ex: user-12345"
              style={idInputStyle}
            />
          </div>

          {/* Gender */}
          <div>
            <label style={labelStyle}>Gênero</label>
            <select name="gender" value={formData.gender} onChange={handleChange} style={inputStyle}>
              <option value="Male">Masculino</option>
              <option value="Female">Feminino</option>
              <option value="Other">Outro</option>
            </select>
          </div>

          {/* Age */}
          <div>
            <label style={labelStyle}>Idade</label>
            <input type="number" name="age" value={formData.age} onChange={handleChange} min="10" max="120" style={inputStyle} />
          </div>

          {/* Country */}
          <div>
            <label style={labelStyle}>País</label>
            <select name="country" value={formData.country} onChange={handleChange} style={inputStyle}>
              <option value="BR">Brasil</option>
              <option value="US">Estados Unidos</option>
              <option value="UK">Reino Unido</option>
              <option value="FR">França</option>
              <option value="DE">Alemanha</option>
              <option value="IN">Índia</option>
              <option value="JP">Japão</option>
            </select>
          </div>

          {/* Subscription Type */}
          <div>
            <label style={labelStyle}>Tipo de Assinatura</label>
            <select name="subscription_type" value={formData.subscription_type} onChange={handleChange} style={inputStyle}>
              <option value="Free">Free</option>
              <option value="Premium">Premium</option>
              <option value="Student">Estudante</option>
              <option value="Family">Família</option>
            </select>
          </div>

          {/* Device Type */}
          <div>
            <label style={labelStyle}>Dispositivo</label>
            <select name="device_type" value={formData.device_type} onChange={handleChange} style={inputStyle}>
              <option value="Mobile">Mobile</option>
              <option value="Desktop">Desktop</option>
              <option value="Tablet">Tablet</option>
              <option value="Smart TV">Smart TV</option>
            </select>
          </div>

          {/* Listening Time */}
          <div>
            <label style={labelStyle}>Tempo de Escuta (min/mês)</label>
            <input type="number" name="listening_time" value={formData.listening_time} onChange={handleChange} min="0" style={inputStyle} />
          </div>

          {/* Songs per Day */}
          <div>
            <label style={labelStyle}>Músicas por Dia</label>
            <input type="number" name="songs_played_per_day" value={formData.songs_played_per_day} onChange={handleChange} min="0" style={inputStyle} />
          </div>

          {/* Skip Rate */}
          <div>
            <label style={labelStyle}>Taxa de Pulo (0-1)</label>
            <input type="number" name="skip_rate" value={formData.skip_rate} onChange={handleChange} min="0" max="1" step="0.01" style={inputStyle} />
          </div>

          {/* Ads per Week */}
          <div>
            <label style={labelStyle}>Anúncios por Semana</label>
            <input type="number" name="ads_listened_per_week" value={formData.ads_listened_per_week} onChange={handleChange} min="0" style={inputStyle} />
          </div>

          {/* Offline Listening */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '25px' }}>
            <input type="checkbox" name="offline_listening" checked={formData.offline_listening} onChange={handleChange} style={{ width: '20px', height: '20px' }} />
            <label style={{ color: '#b3b3b3' }}>Usa Download Offline</label>
          </div>
        </div>

        {/* Botão de Envio */}
        <div style={{ gridColumn: 'span 2' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            {loading ? 'Calculando...' : <><Zap size={18} /> Prever Risco de Churn</>}
          </button>
        </div>
      </form>

      {/* Erro de validação local (prioridade) */}
      {formError && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#ff4d4d20',
          border: '1px solid #ff4d4d',
          borderRadius: '4px',
          color: '#ff4d4d'
        }}>
          ⚠️ {formError}
        </div>
      )}

      {/* Erro da API (só aparece se não houver erro local) */}
      {!formError && error && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#ff4d4d20',
          border: '1px solid #ff4d4d',
          borderRadius: '4px',
          color: '#ff4d4d'
        }}>
          ❌ Erro: {error}
        </div>
      )}

      {/* Resultado estilo Dashboard */}
      {result && !error && (
        <div style={{
          marginTop: '30px',
          background: '#121212',
          borderRadius: '6px',
          borderLeft: `6px solid ${statusBorderColor}`,
          padding: '25px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          outline: `1px solid ${statusBg}`
        }}>

          <h4 style={{
            color: statusColor,
            margin: '0 0 20px 0',
            fontSize: '1.1rem',
            fontWeight: 'bold'
          }}>
            Diagnóstico: {formData.user_id || 'Cliente Anônimo'}
          </h4>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '30px',
            alignItems: 'center'
          }}>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <p style={{ color: '#b3b3b3', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 'bold' }}>
                Probabilidade de Churn:
              </p>

              <div style={{
                fontSize: '3.5rem',
                fontWeight: '800',
                color: statusColor,
                lineHeight: '1'
              }}>
                {percentual}
              </div>

              <div style={{
                marginTop: '10px',
                padding: '8px 10px',
                borderRadius: '6px',
                background: statusBg,
                border: `1px solid ${statusBorderColor}`,
                color: 'white',
                fontSize: '0.85rem',
                fontWeight: '700',
                width: 'fit-content'
              }}>
                {faixaInterpretativa}
              </div>
            </div>

            <div style={{
              flex: '2',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              borderLeft: '1px solid #333',
              paddingLeft: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ color: 'white', fontWeight: 'bold' }}>Status:</span>
                <span style={{ color: statusColor, fontWeight: 'bold' }}>{statusLabel}</span>
                <span style={badgeStyle}>{badgeText}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'white', fontWeight: 'bold' }}>Fator de Risco:</span>
                <span style={{ color: riskFactorColor }}>{riskFactor}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'white', fontWeight: 'bold' }}>Fator de Retenção:</span>
                <span style={{ color: '#1DB954' }}>{retentionFactor}</span>
              </div>

              {suggestedAction && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Recomendação:</span>
                  <span style={{ color: '#b3b3b3' }}>{suggestedAction}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}