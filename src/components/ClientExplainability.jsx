import React from 'react';

export function ClientExplainability({ client }) {
  if (!client) return null;

  const threshold = 0.45; 
  const isHighRisk = client.probability > threshold;

  const traducao = {
    'gender': 'Gênero', 'gender_Male': 'Gênero Masculino', 'gender_Female': 'Gênero Feminino',
    'age': 'Idade', 'Age': 'Idade', 'country': 'País', 'country_FR': 'País França',
    'country_IN': 'País Índia', 'subscription_type': 'Tipo de Assinatura',
    'subscription_type_Student': 'Assinatura Estudante', 
    'listening_time': 'Tempo de Escuta',
    'songs_played_per_day': 'Músicas por Dia', 'skip_rate': 'Taxa de Pulagem',
    'device_type': 'Tipo de Dispositivo', 'ads_listened_per_week': 'Anúncios por Semana',
    'offline_listening': 'Uso Offline', 'is_churned': 'Cancelamento (Churn)',
    'songs_per_minute': 'Músicas por Minuto', 'ad_intensity': 'Intensidade de Anúncios',
    'frustration_index': 'Índice de Frustração', 'is_heavy_user': 'Usuário Intenso (Heavy)',
    'premium_no_offline': 'Premium sem Offline', 'premium_sub_month': 'Meses de Assinatura Premium',
    'fav_genre': 'Gênero Favorito'
  };

  const traduzir = (termo) => {
    if (!termo || termo === "N/A") return "N/A";
    const termoLimpo = termo.replace(/^num__/, "").replace(/^cat__/, "");
    return traducao[termoLimpo] || termoLimpo;
  };

  return (
    <div className="card" style={{
      background: '#181818',
      padding: '25px',
      borderRadius: '8px',
      borderLeft: `5px solid ${isHighRisk ? '#ff4d4d' : '#1DB954'}`,
      width: '100%'
    }}>
      <h3 style={{ color: isHighRisk ? '#ff4d4d' : '#1DB954', marginBottom: '20px' }}>
        Diagnóstico: Cliente {client.clientId}
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '60px',
        marginTop: '15px',
        alignItems: 'start'
      }}>
        <div>
          <p style={{ color: '#b3b3b3', marginBottom: '10px' }}><strong>Probabilidade de Churn:</strong></p>
          <h2 style={{
            fontSize: '1.8rem',
            color: isHighRisk ? '#ff4d4d' : '#1DB954'
          }}>
            {((client.probability || 0) * 100).toFixed(1)}%
          </h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p>
            <strong>Status:</strong>
            <span style={{
              marginLeft: '8px',
              color: isHighRisk ? '#ff4d4d' : '#1DB954',
              fontWeight: 'bold'
            }}>
              {isHighRisk ? "Risco de Saída" : "Cliente Fiel"}
            </span>
          </p>
          
          <p>
            <strong>Fator de Risco:</strong>
            <span style={{ color: '#ff4d4d', marginLeft: '8px' }}>
              {traduzir(client.primary_risk_factor)}
            </span>
          </p>
          
          <p>
            <strong>Fator de Retenção:</strong>
            <span style={{ color: '#1DB954', marginLeft: '8px' }}>
              {traduzir(client.primary_retention_factor || client.secondary_factor)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}