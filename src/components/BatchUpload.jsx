import { useState, useRef, useEffect } from 'react';
import { useBatchProcessing } from '../hooks/usePrediction';
import { UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';

export function BatchUpload({ onUploadSuccess }) {
  const { uploadFile, checkStatus, startPolling, reset, loading, error, jobId, status, polling } = useBatchProcessing();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Inicia polling quando receber jobId
  useEffect(() => {
    if (jobId && status?.status !== 'COMPLETED' && status?.status !== 'FAILED') {
      return startPolling(2000);
    }
  }, [jobId, status?.status, startPolling]);

  // Notifica sucesso no upload
  useEffect(() => {
    if (status?.status === 'COMPLETED' && onUploadSuccess) {
      onUploadSuccess();
    }
  }, [status?.status, onUploadSuccess]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx'))) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e) => {
    if (e) e.preventDefault();
    if (!selectedFile) return;

    try {
      await uploadFile(selectedFile);
    } catch (err) {
      console.error('Erro no upload:', err);
    }
  };

  const handleReset = () => {
    reset();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = (e) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (st) => {
    switch (st) {
      case 'COMPLETED': return '#1DB954';
      case 'FAILED': return '#ff4d4d';
      case 'RUNNING': return '#ffcc00';
      default: return '#b3b3b3';
    }
  };

  return (
      <div style={{ background: '#242424', padding: '30px', borderRadius: '8px', borderLeft: '5px solid #1DB954' }}>
        <h3 style={{ marginBottom: '25px', fontSize: '1.25rem' }}>
          <UploadCloud size={24} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
          Upload de Arquivo em Lote
        </h3>

        <input
            id="batch-upload-input"
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', borderWidth: 0 }}
            accept=".csv, .xlsx"
        />

        {/* Área de Upload (Só aparece se não houver job rodando) */}
        {!jobId && (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
              <div
                  role="button"
                  onClick={triggerFileSelect}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  style={{
                    display: 'block',
                    border: `2px dashed ${dragActive ? '#1DB954' : '#333'}`,
                    borderRadius: '8px',
                    padding: '50px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: dragActive ? '#1DB95410' : '#181818',
                    transition: 'all 0.2s ease',
                  }}
              >
                <UploadCloud size={48} color="#b3b3b3" style={{ marginBottom: '15px' }} />
                <p style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: 'white' }}>
                  Arraste seu arquivo CSV ou XLSX aqui
                </p>
                <p style={{ color: '#666', fontSize: '0.85rem' }}>
                  ou clique para selecionar
                </p>
              </div>
            </motion.div>
        )}

        {/* Arquivo Selecionado */}
        {selectedFile && (
            <div style={{
              background: '#181818',
              padding: '15px 20px',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div>
                <p style={{ color: '#fff', fontWeight: 'bold' }}>{selectedFile.name}</p>
                <p style={{ color: '#b3b3b3', fontSize: '0.85rem' }}>{formatBytes(selectedFile.size)}</p>
              </div>

              {/* VISUAL UPDATE 1: Botão Remover some se JobId existir */}
              {!jobId && (
                  <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                      style={{
                        background: 'transparent',
                        border: '1px solid #ff4d4d',
                        color: '#ff4d4d',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                  >
                    Remover
                  </button>
              )}
            </div>
        )}

        {/* VISUAL UPDATE 1: Botão Iniciar some se JobId existir */}
        {!jobId && (
            <button
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile || loading}
                style={{
                  padding: '14px 28px',
                  background: selectedFile && !loading ? '#1DB954' : '#333',
                  color: selectedFile && !loading ? '#000' : '#666',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: selectedFile && !loading ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                }}
            >
              {loading ? '⏳ Enviando...' : '🚀 Iniciar Processamento'}
            </button>
        )}

        {/* Erro */}
        {error && (
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

        {/* Status do Job */}
        {jobId && status && (
            <div style={{
              marginTop: '20px', // Adicionado margem superior já que o botão sumiu
              background: '#181818',
              padding: '25px',
              borderRadius: '8px',
              borderLeft: `5px solid ${getStatusColor(status.status)}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ color: getStatusColor(status.status), margin: 0 }}>
                  {status.status === 'COMPLETED' ? '✅ Processamento Concluído' :
                      status.status === 'FAILED' ? '❌ Processamento Falhou' :
                          status.status === 'RUNNING' ? '⏳ Processando...' : '📋 Status do Job'}
                </h4>
                {polling && <span style={{ color: '#b3b3b3', fontSize: '0.85rem' }}>🔄 Atualizando...</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <p style={{ color: '#b3b3b3', fontSize: '0.85rem', marginBottom: '5px' }}>Job ID</p>
                  <p style={{ color: '#fff', fontFamily: 'monospace', fontSize: '0.9rem' }}>{jobId.slice(0, 8)}...</p>
                </div>

                <div>
                  <p style={{ color: '#b3b3b3', fontSize: '0.85rem', marginBottom: '5px' }}>Status</p>
                  <p style={{ color: getStatusColor(status.status), fontWeight: 'bold' }}>{status.status}</p>
                </div>

                {status.processed !== undefined && (
                    <div>
                      <p style={{ color: '#b3b3b3', fontSize: '0.85rem', marginBottom: '5px' }}>Processados</p>
                      <p style={{ color: '#fff' }}>{status.processed?.toLocaleString() || 0}</p>
                    </div>
                )}

                {status.success_count !== undefined && (
                    <div>
                      <p style={{ color: '#b3b3b3', fontSize: '0.85rem', marginBottom: '5px' }}>Sucesso</p>
                      <p style={{ color: '#1DB954' }}>{status.success_count?.toLocaleString() || 0}</p>
                    </div>
                )}

                {status.error_count !== undefined && status.error_count > 0 && (
                    <div>
                      <p style={{ color: '#b3b3b3', fontSize: '0.85rem', marginBottom: '5px' }}>Erros</p>
                      <p style={{ color: '#ff4d4d' }}>{status.error_count?.toLocaleString() || 0}</p>
                    </div>
                )}
              </div>

              {/* Barra de Progresso */}
              {status.status === 'RUNNING' && status.processed !== undefined && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ background: '#333', borderRadius: '10px', height: '10px', overflow: 'hidden' }}>
                      <div style={{
                        background: '#1DB954',
                        height: '100%',
                        width: `${Math.min((status.processed / (status.total || status.processed)) * 100, 100)}%`,
                        transition: 'width 0.3s ease',
                      }}></div>
                    </div>
                  </div>
              )}

              {/* VISUAL UPDATE 2: Remover os colchetes [] */}
              {status.message && status.message !== '[]' && (
                  <p style={{ color: '#b3b3b3', fontSize: '0.9rem', marginBottom: '20px' }}>{status.message}</p>
              )}

              {/* Botões */}
              <div style={{ display: 'flex', gap: '10px' }}>
                {(status.status === 'COMPLETED' || status.status === 'FAILED') && (
                    <button
                        type="button"
                        onClick={handleReset}
                        style={{
                          padding: '12px 24px',
                          background: '#1DB954',
                          color: '#000',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                        }}
                    >
                      📁 Novo Upload
                    </button>
                )}

                {!polling && status.status === 'RUNNING' && (
                    <button
                        type="button"
                        onClick={() => checkStatus()}
                        style={{
                          padding: '12px 24px',
                          background: '#242424',
                          color: '#fff',
                          border: '1px solid #333',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                    >
                      🔄 Atualizar Status
                    </button>
                )}
              </div>
            </div>
        )}

        {/* Informações */}
        <div style={{ marginTop: '25px', padding: '15px', background: '#181818', borderRadius: '4px' }}>
          <p style={{ color: '#b3b3b3', fontSize: '0.85rem', marginBottom: '10px' }}>
            📋 <strong>Formatos suportados:</strong> CSV, XLSX
          </p>
          <p style={{ color: '#b3b3b3', fontSize: '0.85rem', marginBottom: '10px' }}>
            📦 <strong>Tamanho máximo:</strong> 200MB (~1 milhão de registros)
          </p>
        </div>
      </div>
  );
}