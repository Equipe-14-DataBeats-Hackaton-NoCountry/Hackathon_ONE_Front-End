import { useState, useMemo } from 'react'
import { MetricCard } from '../components/MetricCard'
import { ChurnDistributionChart, FeatureImportanceChart } from '../components/Charts'
import { ClientExplainability } from '../components/ClientExplainability'
import { useClients } from '../hooks/useClients'
import { useData } from '../hooks/useData'

export default function Dashboard() {
  const clients = useClients()
  const { metrics } = useData()
  const [selectedClientId, setSelectedClientId] = useState(null)
  const [selectedRiskFactor, setSelectedRiskFactor] = useState("")

  // Engine de Decisão com sua tradução e ações oficiais
const engineDados = {
    "Gênero": { nome: "Gênero", acao: "Ajustar campanhas de marketing para segmentação de gênero específica." },
    "Gênero Masculino": { nome: "Gênero Masculino", acao: "Ajustar campanhas de marketing para segmentação de gênero masculino." },
    "Gênero Feminino": { nome: "Gênero Feminino", acao: "Ajustar campanhas de marketing para segmentação de gênero feminino." },
    "Idade": { nome: "Idade", acao: "Oferecer planos adequados à faixa etária (ex: Universitário ou Família)." },
    "País": { nome: "País", acao: "Localizar conteúdo e ajustar preços conforme a moeda e região." },
    "País França": { nome: "País França", acao: "Localizar conteúdo e ajustar preços conforme a moeda e região francesa." },
    "País Índia": { nome: "País Índia", acao: "Localizar conteúdo e ajustar preços conforme a moeda e região indiana." },
    "Tipo de Assinatura": { nome: "Tipo de Assinatura", acao: "Sugerir upgrade para planos com mais benefícios." },
    "Assinatura Estudante": { nome: "Assinatura Estudante", acao: "Apresentar planos exclusivos para estudantes e após formar, oferecer descontos no plano premium ou plano pré-pago" },
    "Tempo de Escuta": { nome: "Tempo de Escuta", acao: "Enviar recomendações personalizadas para aumentar o engajamento." },
    "Músicas por Dia": { nome: "Músicas por Dia", acao: "Notificações push com novas playlists baseadas no comportamento diário." },
    "Taxa de Pulagem": { nome: "Taxa de Pulagem", acao: "Recalibrar algoritmo de recomendação para reduzir pulos." },
    "Tipo de Dispositivo": { nome: "Tipo de Dispositivo", acao: "Otimizar interface e bugs específicos para o hardware do usuário." },
    "Anúncios por Semana": { nome: "Anúncios por Semana", acao: "Oferecer teste Premium para aliviar interrupções de áudio. Após o teste, oferecer plano premium ou plano pré-pago." },
    "Uso Offline": { nome: "Uso Offline", acao: "Destacar funcionalidades de download em campanhas educacionais." },
    "Músicas por Minuto": { nome: "Músicas por Minuto", acao: "Sugerir playlists focadas em ritmos específicos." },
    "Intensidade de Anúncios": { nome: "Intensidade de Anúncios", acao: "Reduzir carga de anúncios temporariamente para reter o usuário. Ofertar planos sem anúncios." },
    "Índice de Frustração": { nome: "Índice de Frustração", acao: "Enviar pesquisa de satisfação com cupom de desconto imediato." },
    "Usuário Intenso (Heavy)": { nome: "Usuário Intenso (Heavy)", acao: "Oferecer programa de recompensas e acesso antecipado a recursos." },
    "Premium sem Offline": { nome: "Premium sem Offline", acao: "Sugerir plano Premium completo com suporte a downloads." }
  };

  const mapaTraducao = {
    "gender": "Gênero", "age": "Idade", "Age": "Idade", "country": "País",
    "subscription_type": "Tipo de Assinatura", 
    "listening_time": "Tempo de Escuta", 
    "songs_played_per_day": "Músicas por Dia", "skip_rate": "Taxa de Pulagem",
    "device_type": "Tipo de Dispositivo", "ads_listened_per_week": "Anúncios por Semana",
    "offline_listening": "Uso Offline", "is_churned": "Cancelamento (Churn)",
    "songs_per_minute": "Músicas por Minuto", "ad_intensity": "Intensidade de Anúncios",
    "frustration_index": "Índice de Frustração", "is_heavy_user": "Usuário Intenso (Heavy)",
    "premium_no_offline": "Premium sem Offline", "country_FR": "País França",
    "country_IN": "País Índia", "subscription_type_Student": "Assinatura Estudante",
    "gender_Male": "Gênero Masculino", "gender_Female": "Gênero Feminino"
  };

  const traduzir = (termo) => {
    if (!termo) return "";
    const limpo = termo.replace(/^num__|^cat__/, "");
    return mapaTraducao[limpo] || limpo;
  };

  const statsPorMotivo = useMemo(() => {
    if (!clients) return {};
    const emRisco = clients.filter(c => c.probability > 0.45);
    return emRisco.reduce((acc, c) => {
      const factor = traduzir(c.primary_risk_factor);
      if (!factor) return acc;
      if (!acc[factor]) acc[factor] = { qtd: 0, totalRisco: emRisco.length };
      acc[factor].qtd += 1;
      return acc;
    }, {});
  }, [clients]);

  if (!clients || clients.length === 0 || !metrics) {
    return <div style={{ background: '#121212', color: 'white', height: '100vh', padding: '50px', textAlign: 'center' }}>Sincronizando Inteligência...</div>;
  }

  const selectedClient = clients.find(c => String(c.clientId) === String(selectedClientId)) || clients[0];
  const motivoInfo = engineDados[selectedRiskFactor];
  const motivoStats = statsPorMotivo[selectedRiskFactor];

  const containerStyle = {
    marginBottom: '50px',
    borderLeft: '5px solid #1DB954',
    padding: '25px',
    background: '#242424',
    borderRadius: '8px'
  };

  const selectStyle = {
    padding: '12px',
    background: '#121212',
    color: 'white',
    border: '1px solid #1DB954',
    borderRadius: '4px',
    width: '100%',
    maxWidth: '400px',
    marginBottom: '20px'
  };

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', color: 'white' }}>
      
      {/* HEADER FORMATADO: LOGO E TITULO LADO A LADO */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        marginBottom: '50px',
        flexWrap: 'wrap'
      }}>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg"
          style={{ width: '200px', height: 'auto' }}
          alt="Spotify Logo"
        />
        <div style={{ width: '2px', height: '40px', background: '#333' }}></div>
        <h2 style={{ color: '#1DB954', fontSize: '1.8rem', fontWeight: 'bold' }}>
          Churn Analytics
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '50px' }}>
        <MetricCard title="Total Clientes" value={metrics.totalCustomers} />
        <MetricCard title="Taxa de Churn" value={`${((metrics.churnRate || 0) * 100).toFixed(1)}%`} />
        <MetricCard title="Recall IA" value={metrics.recall} />
        <MetricCard title="AUC Confiança" value={metrics.auc} />
      </div>

      <div className="card" style={containerStyle}>
        <h3 style={{ marginBottom: '20px', fontSize: '1.25rem' }}>Filtrar por Motivo de Risco (IA)</h3>
        <select value={selectedRiskFactor} onChange={(e) => setSelectedRiskFactor(e.target.value)} style={selectStyle}>
          <option value="">Selecione um fator de risco...</option>
          {Object.keys(statsPorMotivo).sort().map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        {selectedRiskFactor && motivoStats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#181818', padding: '20px', borderRadius: '8px' }}>
              <p style={{ color: '#b3b3b3', fontSize: '1.1rem' }}>CLIENTES AFETADOS</p>
              <h2 style={{ color: '#ff4d4d', margin: '10px 0' }}>{motivoStats.qtd} usuários</h2>
              <p style={{ fontSize: '0.85rem' }}>Impacto: {((motivoStats.qtd / motivoStats.totalRisco) * 100).toFixed(1)}% do risco.</p>
            </div>
            <div style={{ background: '#181818', padding: '20px', borderRadius: '8px', border: '1px dashed #1DB954' }}>
              <p style={{ color: '#1DB954', fontSize: '1.2rem', fontWeight: 'bold' }}>💡 AÇÃO RECOMENDADA</p>
              <p style={{ marginTop: '10px', fontSize: '1rem', lineHeight: '1.5' }}>{motivoInfo?.acao}</p>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px', marginBottom: '60px' }}>
        <div className="card" style={{ background: '#242424', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '20px' }}>Composição da Base</h3>
          <div style={{ height: '350px' }}>
            <ChurnDistributionChart data={metrics.churnDistribution} />
          </div>
        </div>
        <div className="card" style={{ background: '#242424', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '20px' }}>Drivers de Decisão (IA)</h3>
          <div style={{ height: '350px' }}>
            <FeatureImportanceChart data={metrics.featureImportance} />
          </div>
        </div>
      </div>

      <div className="card" style={containerStyle}>
        <h3 style={{ marginBottom: '20px', fontSize: '1.25rem' }}>Análise Individual de Retenção</h3>
        <select 
          value={selectedClientId || ""} 
          onChange={e => setSelectedClientId(e.target.value)} 
          style={selectStyle}
        >
          <option value="">Selecione um Cliente (ID)</option>
          {clients.sort((a,b) => a.clientId - b.clientId).map(c => (
            <option key={c.clientId} value={c.clientId}>ID do Cliente: {c.clientId}</option>
          ))}
        </select>
        
        {selectedClient && (
          <div style={{ marginTop: '10px' }}>
            <ClientExplainability client={selectedClient} />
          </div>
        )}
      </div>
    </div>
  )
}