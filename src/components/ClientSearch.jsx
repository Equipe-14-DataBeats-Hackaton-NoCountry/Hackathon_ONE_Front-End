/**
 * Componente de busca avançada e listagem de clientes.
 *
 * Responsabilidades:
 * - Exibir tabela paginada de clientes com predições de churn
 * - Fornecer filtros complexos (status, demografia, probabilidade)
 * - Exibir estatísticas gerais (KPIs) da busca atual com tratamento seguro de dados
 * - Permitir ordenação e seleção para detalhes
 *
 * Correções aplicadas:
 * - Suporte híbrido para APIs (camelCase e snake_case)
 * - Lógica de paginação robusta (cálculo de range e total real)
 * - Tabela com scroll vertical e cabeçalho fixo (sticky header)
 * - Tratamento de valores nulos (NaN fix)
 *
 * @component
 * @returns {JSX.Element} Painel completo de busca e gestão de risco
 */

import { useState, useEffect, memo } from 'react';
import { useClientSearch } from '../hooks/useClientSearch';

// RISCO (padrão do produto): 0–40 / 40–60 / 60–100
// Alinhado com o Back-End
const LOW_MAX = 0.40;
const MOD_MAX = 0.60;

const getProb = (client) => {
  const raw =
    client?.probability !== undefined ? client.probability :
    (client?.churnProbability !== undefined ? client.churnProbability :
    (client?.churn_probability !== undefined ? client.churn_probability : 0));
  const prob = Number(raw);
  return Number.isFinite(prob) ? prob : 0;
};

const getRiskLevel = (prob) => {
  if (prob >= MOD_MAX) return 'high';
  if (prob >= LOW_MAX) return 'mod';
  return 'low';
};

const riskPalette = {
  low: { color: '#1DB954', bg: '#1DB95420', border: '#1DB954', label: 'BAIXO RISCO', text: 'Baixo Risco de Cancelamento', faixa: '0–40% → Baixo Risco' },
  mod: { color: '#f1c40f', bg: '#f1c40f20', border: '#f1c40f', label: 'RISCO MODERADO', text: 'Risco Moderado de Cancelamento', faixa: '40–60% → Risco Moderado' },
  high: { color: '#ff4d4d', bg: '#ff4d4d20', border: '#ff4d4d', label: 'ALTO RISCO', text: 'Alto Risco de Cancelamento', faixa: '60–100% → Alto Risco' },
};

// --- ESTILOS ---
const styles = {
  container: {
    background: '#242424',
    padding: '25px',
    borderRadius: '8px',
    borderLeft: '5px solid #1DB954',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  filterSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
    padding: '20px',
    background: '#181818',
    borderRadius: '8px',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    color: '#b3b3b3',
    fontSize: '0.8rem',
    fontWeight: '500',
  },
  input: {
    padding: '10px 12px',
    background: '#121212',
    color: 'white',
    border: '1px solid #333',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
  select: {
    padding: '10px 12px',
    background: '#121212',
    color: 'white',
    border: '1px solid #333',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  button: {
    padding: '10px 20px',
    background: '#1DB954',
    color: '#000',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    transition: 'opacity 0.2s',
  },
  buttonSecondary: {
    padding: '10px 20px',
    background: 'transparent',
    color: '#fff',
    border: '1px solid #333',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  tableContainer: {
    width: '100%',
    overflowX: 'auto',
    overflowY: 'auto',
    maxHeight: '550px',
    border: '1px solid #333',
    borderRadius: '4px',
    marginTop: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
  },
  th: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    padding: '12px 15px',
    textAlign: 'left',
    background: '#181818',
    color: '#b3b3b3',
    fontSize: '0.85rem',
    fontWeight: '600',
    borderBottom: '2px solid #333',
    cursor: 'pointer',
    userSelect: 'none',
  },
  td: {
    padding: '12px 15px',
    borderBottom: '1px solid #282828',
    fontSize: '0.9rem',
    background: '#242424',
  },

  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px',
    padding: '15px',
    background: '#181818',
    borderRadius: '8px',
  },

  // ✅ badge padrão por nível de risco
  riskBadge: (level) => {
    const p = riskPalette[level] || riskPalette.low;
    return {
      padding: '4px 10px',
      borderRadius: '999px',
      fontSize: '0.75rem',
      fontWeight: '800',
      background: p.color,
      color: '#000',
      border: `1px solid ${p.border}`,
      display: 'inline-flex',
      alignItems: 'center',
      lineHeight: '1',
      textTransform: 'uppercase',
      letterSpacing: '0.3px',
      width: 'fit-content'
    };
  },

  // Mantém % com cor (já estava bom)
  probability: (prob) => ({
    color: prob >= MOD_MAX ? '#ff4d4d' : prob >= LOW_MAX ? '#ffcc00' : '#1DB954',
    fontWeight: 'bold',
  }),
};

/**
 * Linha individual da tabela.
 */
const ClientRow = memo(({ client, onSelect }) => {
  const userId = client.userId || client.user_id || '-';
  const subType = client.subscriptionType || client.subscription_type || '-';

  const prob = getProb(client);
  const level = getRiskLevel(prob);
  const p = riskPalette[level];

  const action = client.recommendedAction || client.recommended_action || '';
  const dateStr = client.createdAt || client.created_at;

  return (
    <tr
      style={{ cursor: 'pointer' }}
      onClick={() => onSelect?.(client)}
      onMouseEnter={(e) => Array.from(e.currentTarget.children).forEach(td => td.style.background = '#2a2a2a')}
      onMouseLeave={(e) => Array.from(e.currentTarget.children).forEach(td => td.style.background = '#242424')}
    >
      <td style={styles.td}>{userId}</td>
      <td style={styles.td}>{client.gender || '-'}</td>
      <td style={styles.td}>{client.age || '-'}</td>
      <td style={styles.td}>{client.country || '-'}</td>
      <td style={styles.td}>{subType}</td>

      {/* ✅ Status padronizado */}
      <td style={styles.td}>
        <span style={styles.riskBadge(level)}>{p.label}</span>
      </td>

      {/* Probabilidade */}
      <td style={{ ...styles.td, ...styles.probability(prob) }}>
        {(prob * 100).toFixed(1)}%
      </td>

      <td style={styles.td}>
        <span style={{ fontSize: '0.8rem', color: '#b3b3b3' }}>
          {action.substring(0, 30)}{action.length > 30 ? '...' : ''}
        </span>
      </td>

      <td style={styles.td}>
        {dateStr ? new Date(dateStr).toLocaleDateString('pt-BR') : '-'}
      </td>
    </tr>
  );
});

ClientRow.displayName = 'ClientRow';

/**
 * Painel de filtros expansível.
 */
const FilterPanel = memo(({ filters, filterOptions, onClear, onSearch }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const handleChange = (key, value) => setLocalFilters(prev => ({ ...prev, [key]: value || null }));

  return (
    <div style={styles.filterSection}>
      <div style={styles.filterGroup}>
        <label style={styles.label}>Status</label>
        <select
          style={styles.select}
          value={localFilters.status || ''}
          onChange={(e) => handleChange('status', e.target.value)}
        >
          <option value="">Todos</option>
          <option value="WILL_CHURN">Vai Cancelar</option>
          <option value="WILL_STAY">Vai Continuar</option>
        </select>
      </div>

      <div style={styles.filterGroup}>
        <label style={styles.label}>Gênero</label>
        <select style={styles.select} value={localFilters.gender || ''} onChange={(e) => handleChange('gender', e.target.value)}>
          <option value="">Todos</option>
          <option value="Male">Masculino</option>
          <option value="Female">Feminino</option>
          <option value="Other">Outros</option>
        </select>
      </div>

      <div style={styles.filterGroup}>
        <label style={styles.label}>Idade (min-max)</label>
        <div style={{ display: 'flex', gap: '5px' }}>
          <input type="number" placeholder="Min" style={{ ...styles.input, width: '50%' }} value={localFilters.minAge || ''} onChange={(e) => handleChange('minAge', e.target.value)} />
          <input type="number" placeholder="Max" style={{ ...styles.input, width: '50%' }} value={localFilters.maxAge || ''} onChange={(e) => handleChange('maxAge', e.target.value)} />
        </div>
      </div>

      <div style={styles.filterGroup}>
        <label style={styles.label}>Assinatura</label>
        <select style={styles.select} value={localFilters.subscriptionType || ''} onChange={(e) => handleChange('subscriptionType', e.target.value)}>
          <option value="">Todas</option>
          <option value="Free">Free</option>
          <option value="Premium">Premium</option>
          <option value="Student">Estudante</option>
          <option value="Family">Família</option>
        </select>
      </div>

      <div style={styles.filterGroup}>
        <label style={styles.label}>Probabilidade (%)</label>
        <div style={{ display: 'flex', gap: '5px' }}>
          <input
            type="number"
            placeholder="Min"
            min="0"
            max="100"
            style={{ ...styles.input, width: '50%' }}
            value={localFilters.minProbability ? localFilters.minProbability * 100 : ''}
            onChange={(e) => handleChange('minProbability', e.target.value ? e.target.value / 100 : null)}
          />
          <input
            type="number"
            placeholder="Max"
            min="0"
            max="100"
            style={{ ...styles.input, width: '50%' }}
            value={localFilters.maxProbability ? localFilters.maxProbability * 100 : ''}
            onChange={(e) => handleChange('maxProbability', e.target.value ? e.target.value / 100 : null)}
          />
        </div>
      </div>

      <div style={styles.filterGroup}>
        <label style={styles.label}>ID do Usuário</label>
        <input type="text" placeholder="Buscar por ID..." style={styles.input} value={localFilters.userId || ''} onChange={(e) => handleChange('userId', e.target.value)} />
      </div>

      <div style={{ ...styles.filterGroup, justifyContent: 'flex-end', flexDirection: 'row', gap: '10px', alignItems: 'flex-end' }}>
        <button style={styles.buttonSecondary} onClick={onClear}>Limpar</button>
        <button style={styles.button} onClick={() => onSearch(localFilters)}>🔍 Buscar</button>
      </div>
    </div>
  );
});

FilterPanel.displayName = 'FilterPanel';

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================
export function ClientSearch() {
  const {
    data,
    loading,
    error,
    filters,
    filterOptions,
    search,
    clearFilters,
    updateSort,
    searchHighRisk,
    nextPage,
    previousPage,
    totalElements,
    totalPages,
    currentPage,
  } = useClientSearch();

  const [selectedClient, setSelectedClient] = useState(null);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    search();
  }, []);

  const handleSort = (field) => {
    const newDir = filters.sortBy === field && filters.sortDir === 'desc' ? 'asc' : 'desc';
    updateSort(field, newDir);
  };

  const getSortIcon = (field) => {
    if (filters.sortBy !== field) return '↕️';
    return filters.sortDir === 'desc' ? '⬇️' : '⬆️';
  };

  const stats = data?.stats || {};

  const safeTotal = totalElements ||
    data?.totalElements ||
    data?.total_elements ||
    (data?.content?.length || 0);

  const safeTotalPages = totalPages ||
    data?.totalPages ||
    data?.total_pages ||
    (safeTotal > 0 ? 1 : 0);

  const pageSize = 10;
  const startRecord = safeTotal === 0 ? 0 : (currentPage * pageSize) + 1;
  const endRecord = Math.min((currentPage + 1) * pageSize, safeTotal);

  const safeWillChurn = stats.willChurnCount || stats.will_churn_count || 0;
  const safeWillStay = stats.willStayCount || stats.will_stay_count || 0;
  const safeAvgProb = stats.avgProbability !== undefined ? stats.avgProbability : (stats.avg_probability || 0);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>🔍 Buscar Clientes</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={styles.buttonSecondary} onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? '🙈 Ocultar Filtros' : '🔧 Mostrar Filtros'}
          </button>
          <button style={{ ...styles.button, background: '#ff4d4d' }} onClick={searchHighRisk}>
            ⚠️ Alto Risco
          </button>
        </div>
      </div>

      {/* Painel de Filtros */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          filterOptions={filterOptions}
          onClear={clearFilters}
          onSearch={search}
        />
      )}

      {/* Barra de Estatísticas (KPIs) */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ background: '#181818', padding: '12px 20px', borderRadius: '8px' }}>
          <span style={{ color: '#b3b3b3', fontSize: '0.8rem' }}>Total: </span>
          <span style={{ color: '#fff', fontWeight: 'bold' }}>{safeTotal.toLocaleString()}</span>
        </div>
        <div style={{ background: '#181818', padding: '12px 20px', borderRadius: '8px' }}>
          <span style={{ color: '#b3b3b3', fontSize: '0.8rem' }}>Na Página - Churn: </span>
          <span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>{safeWillChurn}</span>
          <span style={{ color: '#b3b3b3' }}> | Fiéis: </span>
          <span style={{ color: '#1DB954', fontWeight: 'bold' }}>{safeWillStay}</span>
        </div>
        <div style={{ background: '#181818', padding: '12px 20px', borderRadius: '8px' }}>
          <span style={{ color: '#b3b3b3', fontSize: '0.8rem' }}>Prob. Média: </span>
          <span style={{ color: '#fff', fontWeight: 'bold' }}>{(safeAvgProb * 100).toFixed(1)}%</span>
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#b3b3b3' }}>⏳ Carregando...</div>}

      {error && (
        <div style={{ padding: '15px', background: '#ff4d4d20', border: '1px solid #ff4d4d', borderRadius: '4px', color: '#ff4d4d', marginBottom: '20px' }}>
          ❌ {error}
        </div>
      )}

      {!loading && data?.content && (
        <>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>User ID</th>
                  <th style={styles.th} onClick={() => handleSort('gender')}>Gênero {getSortIcon('gender')}</th>
                  <th style={styles.th} onClick={() => handleSort('age')}>Idade {getSortIcon('age')}</th>
                  <th style={styles.th} onClick={() => handleSort('country')}>País {getSortIcon('country')}</th>
                  <th style={styles.th} onClick={() => handleSort('subscriptionType')}>Assinatura {getSortIcon('subscriptionType')}</th>
                  <th style={styles.th} onClick={() => handleSort('churnStatus')}>Status {getSortIcon('churnStatus')}</th>
                  <th style={styles.th} onClick={() => handleSort('probability')}>Prob. {getSortIcon('probability')}</th>
                  <th style={styles.th}>Ação Recomendada</th>
                  <th style={styles.th} onClick={() => handleSort('createdAt')}>Data {getSortIcon('createdAt')}</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((client, idx) => (
                  <ClientRow
                    key={client.id || client.user_id || idx}
                    client={client}
                    onSelect={setSelectedClient}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div style={styles.pagination}>
            <div style={{ color: '#b3b3b3', fontSize: '0.9rem' }}>
              Mostrando <span style={{ color: 'white', fontWeight: 'bold' }}>{startRecord}-{endRecord}</span> de <span style={{ color: 'white', fontWeight: 'bold' }}>{safeTotal}</span> registros
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button style={{ ...styles.buttonSecondary, opacity: data.first ? 0.5 : 1 }} onClick={previousPage} disabled={data.first}>← Anterior</button>

              {safeTotalPages > 0 && (
                <div style={{
                  background: '#1DB954',
                  color: '#000',
                  width: '30px',
                  height: '30px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}>
                  {currentPage + 1}
                </div>
              )}

              <button style={{ ...styles.buttonSecondary, opacity: data.last ? 0.5 : 1 }} onClick={nextPage} disabled={data.last}>Próxima →</button>
            </div>
          </div>
        </>
      )}

      {!loading && (!data?.content || data.content.length === 0) && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🔍</div>
          <p>Nenhum cliente encontrado com os filtros selecionados.</p>
          <button style={styles.button} onClick={clearFilters}>Limpar Filtros</button>
        </div>
      )}

      {/* Modal de Detalhes */}
      {selectedClient && (() => {
        const prob = getProb(selectedClient);
        const level = getRiskLevel(prob);
        const p = riskPalette[level];

        return (
          <div
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            }}
            onClick={() => setSelectedClient(null)}
          >
            <div
              style={{
                background: '#242424', padding: '30px', borderRadius: '12px', maxWidth: '520px', width: '90%',
                borderLeft: `5px solid ${p.border}`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ marginTop: 0, color: p.color }}>
                Cliente: {selectedClient.userId || selectedClient.user_id || '-'}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span style={styles.riskBadge(level)}>{p.label}</span>
                <span style={{ color: p.color, fontWeight: 'bold' }}>{p.text}</span>
              </div>

              <div style={{
                marginBottom: '18px',
                padding: '8px 10px',
                borderRadius: '6px',
                background: p.bg,
                border: `1px solid ${p.border}`,
                color: 'white',
                fontSize: '0.85rem',
                fontWeight: '700',
                width: 'fit-content'
              }}>
                {p.faixa}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div><p style={{ color: '#b3b3b3', margin: '5px 0', fontSize: '0.85rem' }}>Gênero</p><p style={{ margin: 0, fontWeight: 'bold' }}>{selectedClient.gender || '-'}</p></div>
                <div><p style={{ color: '#b3b3b3', margin: '5px 0', fontSize: '0.85rem' }}>Idade</p><p style={{ margin: 0, fontWeight: 'bold' }}>{selectedClient.age || '-'} anos</p></div>
                <div><p style={{ color: '#b3b3b3', margin: '5px 0', fontSize: '0.85rem' }}>País</p><p style={{ margin: 0, fontWeight: 'bold' }}>{selectedClient.country || '-'}</p></div>
                <div><p style={{ color: '#b3b3b3', margin: '5px 0', fontSize: '0.85rem' }}>Assinatura</p><p style={{ margin: 0, fontWeight: 'bold' }}>{selectedClient.subscriptionType || selectedClient.subscription_type || '-'}</p></div>
                <div><p style={{ color: '#b3b3b3', margin: '5px 0', fontSize: '0.85rem' }}>Dispositivo</p><p style={{ margin: 0, fontWeight: 'bold' }}>{selectedClient.deviceType || selectedClient.device_type || '-'}</p></div>
                <div>
                  <p style={{ color: '#b3b3b3', margin: '5px 0', fontSize: '0.85rem' }}>Probabilidade</p>
                  <p style={{ margin: 0, fontWeight: 'bold', ...styles.probability(prob) }}>
                    {(prob * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div style={{ background: '#181818', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <p style={{ color: '#1DB954', margin: '0 0 10px 0', fontWeight: 'bold' }}>💡 Ação Recomendada</p>
                <p style={{ margin: 0, lineHeight: '1.5' }}>
                  {selectedClient.recommendedAction || selectedClient.recommended_action || 'Nenhuma ação específica.'}
                </p>
              </div>

              <button style={{ ...styles.button, width: '100%' }} onClick={() => setSelectedClient(null)}>Fechar</button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}