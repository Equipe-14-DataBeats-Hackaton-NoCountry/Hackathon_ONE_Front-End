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
        refreshClients();
        refreshMetrics();
    }, []);

     //>>> estados para os dados do endpoint /dashboard/metrics
     const [summary, setSummary] = useState(null)
     const [error, setError] = useState(null)

    useEffect(() => 
        { const load = async () => { 
            try { 
                const data = await getDashboardMetrics(); 
                console.log("📊 Resposta da API /dashboard/metrics:", data);
                setSummary(data); 
            } catch (err) { 
                setError("Falha ao carregar dados do dashboard"); 
            } 
        }; 
        load(); 
    }, []);

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

    const handleBatchSuccess = () => {
        refreshClients();
        refreshMetrics();
    };

    // --- CORREÇÃO: Cálculo dos Fatores de Risco com Debug ---
    const statsPorMotivo = useMemo(() => {
        if (!clients || !Array.isArray(clients) || clients.length === 0) return {};

        // Debug: Verificar o primeiro cliente para entender a estrutura
        // Abra o console do navegador (F12) para ver isso
        console.log("🔍 Estrutura do Cliente[0]:", clients[0]);

        const getProb = (c) => {
            // Tenta pegar probabilidade de qualquer campo possível
            const val = c.probability ?? c.churnProbability ?? c.churn_probability ?? c.probabilidade;
            return val !== undefined ? parseFloat(val) : 0;
        };

        const getRiskFactor = (c) => {
            // Tenta pegar o fator de qualquer campo possível
            return c.primary_risk_factor || c.primaryRiskFactor || c.main_factor || c.fator_risco || "";
        };

        const emRisco = clients.filter(c => getProb(c) > 0.45);
        console.log(`📊 Clientes em Risco (Filtrados no Front): ${emRisco.length} de ${clients.length}`);

        return emRisco.reduce((acc, c) => {
            const rawFactor = getRiskFactor(c);
            const factor = traduzir(rawFactor);

            if (!factor) return acc;

            if (!acc[factor]) acc[factor] = { qtd: 0, totalRisco: emRisco.length };
            acc[factor].qtd += 1;
            return acc;
        }, {});
    }, [clients]);
    // -----------------------------------------------------

    const isInitialLoading = (clientsLoading || metricsLoading) && !metrics;
    const isBackgroundRefreshing = (clientsLoading || metricsLoading) && metrics;

    if (isInitialLoading) {
        return (
            <div style={{ background: '#121212', color: 'white', height: '100vh', padding: '50px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '20px' }}>🔄 Sincronizando Inteligência...</div>
                <div style={{ color: '#b3b3b3' }}>Conectando à API ChurnInsight</div>
            </div>
        );
    }

    if (clientsError || !metrics) {
        return (
            <div style={{ background: '#121212', color: '#ff4d4d', height: '100vh', padding: '50px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '20px' }}>⚠️ Erro ao carregar dados</div>
                <p style={{ color: '#b3b3b3' }}>{clientsError || "Não foi possível carregar as métricas do dashboard."}</p>
                <button
                    onClick={() => window.location.reload()}
                    style={{ marginTop: '20px', padding: '10px 20px', background: '#1DB954', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    const apiStatusBadge = {
        online: { color: '#1DB954', text: '🟢 API Online' },
        offline: { color: '#ff4d4d', text: '🔴 API Offline' },
        degraded: { color: '#ffcc00', text: '🟡 API Degradada' },
        checking: { color: '#b3b3b3', text: '⏳ Verificando...' },
    }[apiStatus] || { color: '#b3b3b3', text: '❓ Desconhecido' };

    const selectedClient = (clients && clients.length > 0)
        ? clients.find(c => String(c.clientId) === String(selectedClientId)) || clients[0]
        : null;
    const motivoInfo = engineDados[selectedRiskFactor];
    const motivoStats = statsPorMotivo[selectedRiskFactor];

    const tabStyle = (isActive) => ({
        padding: '12px 24px',
        background: isActive ? '#1DB954' : '#242424',
        color: isActive ? '#000' : '#fff',
        border: 'none',
        cursor: 'pointer',
        borderRadius: '24px',
        fontWeight: 'bold',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    });

    return (
        <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Circular, sans-serif' }}>
            {/* HEADER */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}
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

            {!summary && !error && <p>Carregando dados...</p>}
            {error && <p>{error}</p>}

            <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '24px', 
            marginBottom: '40px' 
            }}>
            <MetricCard title="Total de Clientes" value={summary?.total_customers} />
            
            <MetricCard 
                title="Taxa de Churn Global" 
                value={`${summary?.global_churn_rate?.toFixed(1)}%`} 
            />
            
            <MetricCard title="Clientes em Risco" value={summary?.customers_at_risk} />
            
            <MetricCard 
                title="Receita em Risco (Est.)" 
                value={new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
                }).format(summary?.revenue_at_risk || 0)} 
            />
            
            <MetricCard 
                title="Precisão do Modelo" 
                value={`${(summary?.model_accuracy * 100).toFixed(1)}%`} 
            />
            </div>
    
            {/* TABS */}
            <div style={{ marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '15px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveTab('dashboard')} style={tabStyle(activeTab === 'dashboard')}>
                    <LayoutDashboard size={18} /> Dashboard
                </button>
                <button onClick={() => setActiveTab('prediction')} style={tabStyle(activeTab === 'prediction')}>
                    <User size={18} /> Predição Individual
                </button>
                <button onClick={() => setActiveTab('batch')} style={tabStyle(activeTab === 'batch')}>
                    <Upload size={18} /> Upload em Lote
                </button>
                <button onClick={() => setActiveTab('search')} style={tabStyle(activeTab === 'search')}>
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
                                Distribuição de Risco
                            </h3>
                            <div style={{ height: '350px' }}>
                                <ChurnDistributionChart data={metrics.churnDistribution || [0, 0]} />
                            </div>
                        </div>
                        <div style={{ background: '#242424', padding: '30px', borderRadius: '8px' }}>
                            <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Activity size={20} color="#1DB954" />
                                Importância das Features (Top 10)
                            </h3>
                            <div style={{ height: '350px' }}>
                                <FeatureImportanceChart data={metrics.featureImportance || []} />
                            </div>
                        </div>

                        {selectedClient && (
                            <div style={{ background: '#242424', padding: '30px', borderRadius: '8px' }}>
                                <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <User size={20} color="#1DB954" />
                                    Análise Detalhada de Cliente (Exemplo)
                                </h3>
                                <ClientExplainability client={selectedClient} />
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <div style={{ background: '#242424', padding: '30px', borderRadius: '8px' }}>
                            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <AlertTriangle size={20} color="#ffcc00" />
                                Principais Fatores de Risco
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {Object.keys(statsPorMotivo).length === 0 ? (
                                    <p style={{ color: '#666', fontStyle: 'italic' }}>Nenhum fator de risco alto detectado nos dados carregados.</p>
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
                                                    {((qtd / totalRisco) * 100).toFixed(1)}%
                                                </div>
                                            </motion.div>
                                        ))
                                )}
                            </div>
                        </div>

                        {selectedRiskFactor && motivoInfo && (
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

            {/* OUTRAS ABAS (Mantidas) */}
            {activeTab === 'prediction' && (
                <motion.div key="prediction" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ background: '#242424', padding: '40px', borderRadius: '8px' }}>
                        <h2 style={{ marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>Simulador de Churn</h2>
                        <PredictionForm />
                    </div>
                </motion.div>
            )}
            {activeTab === 'batch' && (
                <motion.div key="batch" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                    <BatchUpload onUploadSuccess={handleBatchSuccess} />
                </motion.div>
            )}
            {activeTab === 'search' && (
                <motion.div key="search" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <ClientSearch />
                </motion.div>
            )}
        </div>
    )
}