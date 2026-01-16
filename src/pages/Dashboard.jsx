import { useState, useMemo, useEffect } from 'react'
import { MetricCard } from '../components/MetricCard'
import { ChurnDistributionChart, FeatureImportanceChart } from '../components/Charts'
import { ClientExplainability } from '../components/ClientExplainability'
import { PredictionForm } from '../components/PredictionForm'
import { BatchUpload } from '../components/BatchUpload'
import { ClientSearch } from '../components/ClientSearch'
import { useClients } from '../hooks/useClients'
import { useData } from '../hooks/useData'
import { motion } from 'framer-motion'
import { getDashboardMetrics } from '../services/api'
import { LayoutDashboard, User, Upload, Search, Activity, AlertTriangle } from 'lucide-react'

export default function Dashboard() {
  const { clients, loading: clientsLoading, error: clientsError, refresh: refreshClients } = useClients()
  const { metrics, apiStatus, loading: metricsLoading, refresh: refreshMetrics } = useData()

  const [selectedClientId, setSelectedClientId] = useState(null)
  const [selectedRiskFactor, setSelectedRiskFactor] = useState("")
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    refreshClients()
    refreshMetrics()
  }, [])

  // Dados do endpoint /dashboard/metrics
  const [summary, setSummary] = useState(null)
  const [summaryError, setSummaryError] = useState(null)

  // Regra principal: só mostrar dados quando ONLINE
  const canShowData = apiStatus === 'online'

  useEffect(() => {
    if (!canShowData) return

    const load = async () => {
      try {
        const data = await getDashboardMetrics()
        console.log("📊 Resposta da API /dashboard/metrics:", data)
        setSummary(data)
        setSummaryError(null)
      } catch (err) {
        console.error(err)
        setSummaryError("Falha ao carregar dados do dashboard")
        setSummary(null)
      }
    }

    load()
  }, [canShowData])

  // Quando sai do ONLINE, zera tudo que poderia "sobrar" na tela
  useEffect(() => {
    if (!canShowData) {
      setSummary(null)
      setSummaryError(null)
      setSelectedRiskFactor("")
      setSelectedClientId(null)

      // Se estava numa aba que faz request, volta pro dashboard para evitar NetworkError
      if (activeTab !== 'dashboard') setActiveTab('dashboard')
    }
  }, [canShowData]) // eslint-disable-line react-hooks/exhaustive-deps

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
  }

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
  }

  const traduzir = (termo) => {
    if (!termo) return ""
    const limpo = termo.replace(/^num__|^cat__/, "")
    return mapaTraducao[limpo] || limpo
  }

  const handleBatchSuccess = () => {
    refreshClients()
    refreshMetrics()
  }

  // Principais fatores de risco:
  // - Quando o backend novo existir: usar summary.risk_factors
  // - Enquanto não existir: cai no cálculo local (apenas ONLINE)
  const statsPorMotivo = useMemo(() => {
    if (!canShowData) return {}

    // Se backend já está mandando risk_factors, não usa cálculo local
    if (Array.isArray(summary?.risk_factors) && summary.risk_factors.length > 0) {
      const total = summary.risk_factors.reduce((s, it) => s + (Number(it.count) || 0), 0) || 1
      return summary.risk_factors.reduce((acc, it) => {
        acc[it.name] = { qtd: Number(it.count) || 0, totalRisco: total }
        return acc
      }, {})
    }

    if (!clients || !Array.isArray(clients) || clients.length === 0) return {}

    const getProb = (c) => {
      const val = c.probability ?? c.churnProbability ?? c.churn_probability ?? c.probabilidade
      return val !== undefined ? parseFloat(val) : 0
    }

    const getRiskFactor = (c) => {
      return c.primary_risk_factor || c.primaryRiskFactor || c.main_factor || c.fator_risco || ""
    }

    const emRisco = clients.filter(c => getProb(c) > 0.45)

    return emRisco.reduce((acc, c) => {
      const rawFactor = getRiskFactor(c)
      const factor = traduzir(rawFactor)
      if (!factor) return acc
      if (!acc[factor]) acc[factor] = { qtd: 0, totalRisco: emRisco.length }
      acc[factor].qtd += 1
      return acc
    }, {})
  }, [clients, canShowData, summary])

  const isInitialLoading = (clientsLoading || metricsLoading) && apiStatus === 'checking'
  const isBackgroundRefreshing = (clientsLoading || metricsLoading) && canShowData

  if (isInitialLoading) {
    return (
      <div style={{ background: '#121212', color: 'white', height: '100vh', padding: '50px', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '20px' }}>🔄 Sincronizando Inteligência...</div>
        <div style={{ color: '#b3b3b3' }}>Conectando à API ChurnInsight</div>
      </div>
    )
  }

  if (clientsError) {
    return (
      <div style={{ background: '#121212', color: '#ff4d4d', height: '100vh', padding: '50px', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '20px' }}>⚠️ Erro ao carregar dados</div>
        <p style={{ color: '#b3b3b3' }}>{clientsError}</p>
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: '20px', padding: '10px 20px', background: '#1DB954', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  // Cards: quando OFFLINE => "—"
  const safeTotalCustomers = canShowData ? (summary?.total_customers ?? metrics?.totalClients ?? '—') : '—'

  const safeMonitoringRate = canShowData
    ? ((summary?.global_churn_rate ?? (metrics?.globalChurnRate !== undefined ? Number(metrics.globalChurnRate) : null)) ?? null)
    : null
  const safeMonitoringLabel = safeMonitoringRate === null ? '—' : `${Number(safeMonitoringRate).toFixed(1)}%`

  const safeCustomersAtRisk = canShowData ? (summary?.customers_at_risk ?? metrics?.highRiskCount ?? '—') : '—'

  const safeRevenueAtRisk = canShowData ? ((summary?.revenue_at_risk ?? metrics?.revenueAtRisk ?? null) ?? null) : null
  const safeRevenueLabel =
    safeRevenueAtRisk === null
      ? '—'
      : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safeRevenueAtRisk)

  const safeModelAccuracy = canShowData
    ? ((summary?.model_accuracy ?? null) ?? (metrics?.modelAccuracy !== undefined ? Number(metrics.modelAccuracy) : null))
    : null
  const safeAccuracyLabel =
    safeModelAccuracy === null
      ? '—'
      : (safeModelAccuracy > 1
        ? `${Number(safeModelAccuracy).toFixed(1)}%`
        : `${(Number(safeModelAccuracy) * 100).toFixed(1)}%`)

  const apiStatusBadge = {
    online: { color: '#1DB954', text: '🟢 API Online' },
    offline: { color: '#ff4d4d', text: '🔴 API Offline' },
    degraded: { color: '#ffcc00', text: '🟡 API Degradada' },
    checking: { color: '#b3b3b3', text: '⏳ Verificando...' },
  }[apiStatus] || { color: '#b3b3b3', text: '❓ Desconhecido' }

  const selectedClient = (canShowData && clients && clients.length > 0)
    ? clients.find(c => String(c.clientId) === String(selectedClientId)) || clients[0]
    : null

  const motivoInfo = engineDados[selectedRiskFactor]
  const motivoStats = statsPorMotivo[selectedRiskFactor]

  const tabStyle = (isActive, disabled = false) => ({
    padding: '12px 24px',
    background: isActive ? '#1DB954' : '#242424',
    color: isActive ? '#000' : '#fff',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    borderRadius: '24px',
    fontWeight: 'bold',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  })

  const OfflineBlock = ({ text }) => (
    <div style={{
        height: '350px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        fontStyle: 'italic',
        whiteSpace: 'pre-line',
        textAlign: 'center'
    }}>
        {text}
    </div>
)

  const OfflineScreen = ({ title }) => (
    <div style={{ background: '#242424', padding: '30px', borderRadius: '8px' }}>
      <h3 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <AlertTriangle size={20} color="#ffcc00" />
        {title}
      </h3>
      <p style={{ color: '#b3b3b3', margin: 0 }}>
        API indisponível: este recurso só funciona quando o status for <b>ONLINE</b>.
      </p>
    </div>
  )

  // Dados dos gráficos vindos do summary (backend)
  const churnDist = Array.isArray(summary?.churn_distribution) && summary.churn_distribution.length === 2
  ? summary.churn_distribution
  : null

    const featImportance = Array.isArray(summary?.feature_importance) && summary.feature_importance.length > 0
    ? summary.feature_importance
    : null

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Circular, sans-serif' }}>
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}
      >
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '10px' }}>
            <span style={{ color: '#1DB954' }}>Churn</span>Insight
          </h1>
          <p style={{ color: '#b3b3b3' }}>Dashboard de Retenção de Clientes (Spotify Edition)</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ padding: '8px 16px', borderRadius: '20px', background: '#242424', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} color={apiStatusBadge.color} />
            <span style={{ color: apiStatusBadge.color, fontWeight: 'bold' }}>{apiStatusBadge.text}</span>
          </div>
          {isBackgroundRefreshing ? (
            <p style={{ marginTop: '8px', fontSize: '0.8rem', color: '#1DB954', fontWeight: 'bold' }}>
              🔄 Atualizando dados...
            </p>
          ) : (
            <p style={{ marginTop: '8px', fontSize: '0.8rem', color: '#535353' }}>
              Last sync: {new Date().toLocaleTimeString()}
            </p>
          )}
        </div>
      </motion.div>

      {/* AVISO QUANDO NÃO ONLINE */}
      {!canShowData && (
        <div style={{
          background: '#242424',
          border: '1px solid #333',
          padding: '14px 16px',
          borderRadius: '8px',
          marginBottom: '22px',
          color: '#ffcc00',
          fontWeight: 'bold'
        }}>
          ⚠️ API indisponível: nenhum dado será exibido enquanto o status não for ONLINE.
        </div>
      )}

      {/* Mensagens do summary só quando online */}
      {canShowData && !summary && !summaryError && <p style={{ color: '#b3b3b3' }}>Carregando dados...</p>}
      {canShowData && summaryError && <p style={{ color: '#ff4d4d' }}>{summaryError}</p>}

      {/* CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '24px',
        marginBottom: '16px'
      }}>
        <MetricCard title="Total de Clientes" value={safeTotalCustomers} />
        <MetricCard title="Clientes Prioritários para Ação" value={safeMonitoringLabel} subtitle="Top 25% da base com maior instabilidade" />
        <MetricCard title="Clientes em Risco" value={safeCustomersAtRisk} />
        <MetricCard title="Receita Potencial em Risco (Est.)" value={safeRevenueLabel} />
        <MetricCard title="Precisão do Modelo" value={safeAccuracyLabel} />
      </div>

      {/* NOTA EXPLICATIVA */}
      {canShowData && (
        <div style={{
          fontSize: '0.85rem',
          color: '#888',
          marginBottom: '40px',
          padding: '12px',
          background: '#1a1a1a',
          borderRadius: '6px',
          borderLeft: '3px solid #1DB954'
        }}>
          <strong>Nota:</strong> O gráfico "Distribuição da Classificação do Modelo" mostra toda a base. Já o indicador "Clientes Prioritários para Ação" destaca os 25% que precisam de atenção imediata.
        </div>
      )}

      {/* TABS */}
      <div style={{ marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '15px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('dashboard')} style={tabStyle(activeTab === 'dashboard')}>
          <LayoutDashboard size={18} /> Dashboard
        </button>

        {/* desabilita as abas que fazem request quando offline */}
        <button
          onClick={() => canShowData && setActiveTab('prediction')}
          style={tabStyle(activeTab === 'prediction', !canShowData)}
          disabled={!canShowData}
          title={!canShowData ? "Disponível apenas com API ONLINE" : ""}
        >
          <User size={18} /> Predição Individual
        </button>

        <button
          onClick={() => canShowData && setActiveTab('batch')}
          style={tabStyle(activeTab === 'batch', !canShowData)}
          disabled={!canShowData}
          title={!canShowData ? "Disponível apenas com API ONLINE" : ""}
        >
          <Upload size={18} /> Upload em Lote
        </button>

        <button
          onClick={() => canShowData && setActiveTab('search')}
          style={tabStyle(activeTab === 'search', !canShowData)}
          disabled={!canShowData}
          title={!canShowData ? "Disponível apenas com API ONLINE" : ""}
        >
          <Search size={18} /> Buscar Cliente
        </button>
      </div>

      {/* CONTENT */}
      {activeTab === 'dashboard' && (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}
        >
          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ background: '#242424', padding: '30px', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Activity size={20} color="#1DB954" />
                Distribuição da Classificação do Modelo
              </h3>

                {!canShowData ? (
                <OfflineBlock text="Dados indisponíveis (API Offline)" />
                ) : !churnDist ? (
                <OfflineBlock
                    text="Sem dados de distribuição disponíveis no momento.\n(O backend ainda não forneceu churn_distribution.)"
                />
                ) : (
                <div style={{ height: '350px' }}>
                    <ChurnDistributionChart data={churnDist} />
                </div>
                )}
            </div>

            <div style={{ background: '#242424', padding: '30px', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Activity size={20} color="#1DB954" />
                Importância das Variáveis (Top 10)
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '20px' }}>
                Variáveis com maior peso na predição do modelo
              </p>

            {!canShowData ? (
                <OfflineBlock text="Dados indisponíveis (API Offline)" />
                ) : !featImportance ? (
                <OfflineBlock
                    text="A versão atual do modelo utiliza Regressão Logística com SMOTE, que não fornece interpretabilidade nativa de features. Esta funcionalidade requer algoritmos com suporte a feature importance (ex: XGBoost, Random Forest)."
                    />            
                ) : (
                <div style={{ height: '350px' }}>
                    <FeatureImportanceChart data={featImportance} />
                </div>
                )}
            </div>

            {canShowData && selectedClient && (
              <div style={{ background: '#242424', padding: '30px', borderRadius: '8px' }}>
                <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <User size={20} color="#1DB954" />
                  {selectedClientId ? 'Análise Detalhada do Cliente Selecionado' : 'Análise Detalhada (Amostra)'}
                </h3>
                <ClientExplainability client={selectedClient} />
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ background: '#242424', padding: '30px', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={20} color="#ffcc00" />
                Principais Fatores de Risco
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '15px' }}>
                Fatores mais frequentes entre os clientes prioritários
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {!canShowData ? (
                  <p style={{ color: '#666', fontStyle: 'italic' }}>Dados indisponíveis (API Offline)</p>
                ) : Object.keys(statsPorMotivo).length === 0 ? (
                  <p style={{ color: '#666', fontStyle: 'italic' }}>Nenhum fator de risco detectado nos dados carregados.</p>
                ) : (
                  Object.entries(statsPorMotivo)
                    .sort(([, a], [, b]) => b.qtd - a.qtd)
                    .map(([motivo, { qtd, totalRisco }]) => (
                      <motion.div
                        key={motivo}
                        whileHover={{ scale: 1.02, backgroundColor: '#2a2a2a' }}
                        onClick={() => setSelectedRiskFactor(motivo === selectedRiskFactor ? "" : motivo)}
                        style={{
                          padding: '15px',
                          borderRadius: '8px',
                          background: '#181818',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          border: motivo === selectedRiskFactor ? '1px solid #1DB954' : 'none'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, color: '#b3b3b3', fontSize: '0.9rem' }}>{motivo}</p>
                          <h4 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>{qtd} usuários</h4>
                        </div>
                        <div style={{ color: '#1DB954', fontSize: '1.5rem' }}>
                          {totalRisco > 0 ? ((qtd / totalRisco) * 100).toFixed(1) : '0.0'}%
                        </div>
                      </motion.div>
                    ))
                )}
              </div>
            </div>

            {canShowData && selectedRiskFactor && motivoInfo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ background: '#2a2a2a', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #ffcc00' }}
              >
                <h4 style={{ color: '#ffcc00', margin: '0 0 10px 0' }}>{motivoInfo.nome}</h4>
                <p style={{ color: '#b3b3b3', fontSize: '0.9rem', marginBottom: '15px' }}>
                  {motivoStats?.qtd} clientes impactados
                </p>
                <p style={{ color: '#fff', fontSize: '0.95rem', fontStyle: 'italic' }}>
                  "Ação Recomendada: {motivoInfo.acao}"
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* OUTRAS ABAS */}
      {activeTab === 'prediction' && (canShowData ? (
        <motion.div key="prediction" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ background: '#242424', padding: '40px', borderRadius: '8px' }}>
            <h2 style={{ marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>Simulador de Churn</h2>
            <PredictionForm />
          </div>
        </motion.div>
      ) : (
        <OfflineScreen title="Predição Individual" />
      ))}

      {activeTab === 'batch' && (canShowData ? (
        <motion.div key="batch" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
          <BatchUpload onUploadSuccess={handleBatchSuccess} />
        </motion.div>
      ) : (
        <OfflineScreen title="Upload em Lote" />
      ))}

      {activeTab === 'search' && (canShowData ? (
        <motion.div key="search" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <ClientSearch />
        </motion.div>
      ) : (
        <OfflineScreen title="Buscar Cliente" />
      ))}

    </div>
  )
}