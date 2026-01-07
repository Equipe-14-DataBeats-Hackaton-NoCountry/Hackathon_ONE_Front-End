import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  ArcElement, 
  Tooltip, 
  Legend 
} from 'chart.js';

// Registro obrigatório dos componentes do Chart.js
ChartJS.register(
  BarElement, 
  CategoryScale, 
  LinearScale, 
  ArcElement, 
  Tooltip, 
  Legend
);

const traducaoFeatures = {
  // Variáveis do Dataset e Métricas
  "ads_listened_per_week": "Anúncios p/ Semana",
  "offline_listening": "Escuta Offline",
  "gender": "Gênero",
  "device_type": "Dispositivo",
  "ad_intensity": "Intensidade de Ads",
  "frustration_index": "Índice de Frustração",
  "listening_time": "Tempo de Escuta",
  "songs_played_per_day": "Músicas p/ Dia",
  "skip_rate": "Taxa de Pulos",
  "subscription_type": "Plano",
  "age": "Idade",
  "country": "País",
  "is_heavy_user": "Usuário Intenso",
  
  // Nomes que vêm do Engine de Dados
  "Anúncios por Semana": "Anúncios p/ Semana",
  "Uso Offline": "Uso Offline",
  "Alta Frustração": "Alta Frustração",
  "Intensidade de Ads": "Intensidade de Ads",
  "Baixo Tempo de Uso": "Baixo Tempo de Uso"
};

// --- GRÁFICO DE PIZZA (CHURN) ---
export function ChurnDistributionChart({ data }) {
  if (!data || !Array.isArray(data)) return null;
  const total = data.reduce((a, b) => a + b, 0);

  const chartData = {
    labels: ['Fidelizados', 'Churn'],
    datasets: [{
      data: data,
      backgroundColor: ['#1DB954', '#717171ff'], 
      borderColor: 'transparent',
      borderWidth: 0,
      // Efeito de fatia separada (Explodido)
      offset: [0, 30], 
      // Destaque adicional ao passar o mouse
      hoverOffset: 50,
      hoverBackgroundColor: ['#1ed760', '#919090ff'],
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: { 
          color: '#ffffff', 
          usePointStyle: true,
          padding: 40, 
          font: { size: 12, weight: 'normal' } 
        } 
      },
      tooltip: {
        backgroundColor: '#191414',
        titleColor: '#1DB954',
        bodyColor: '#ffffff',
        displayColors: false,
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const percentage = ((value / total) * 100).toFixed(1) + '%';
            return `${context.label}: ${value} (${percentage})`;
          }
        }
      }
    },
    layout: { padding: 30 }
  };

  return (
    <div style={{ height: '350px', width: '100%', position: 'relative' }}>
      <Pie data={chartData} options={options} />
    </div>
  );
}

// --- GRÁFICO DE BARRAS (IMPORTÂNCIA COM EFEITO DE HOVER) ---
export function FeatureImportanceChart({ data }) {
  if (!data || !Array.isArray(data)) return null;

  const chartData = {
    labels: data.map(f => {
      const nomeLimpo = f.name.replace(/^num__/, "").replace(/^cat__/, "");
      return traducaoFeatures[nomeLimpo] || nomeLimpo;
    }),
    datasets: [{
      label: 'Impacto no Modelo',
      data: data.map(f => f.value),
      backgroundColor: '#1DB954',
      borderRadius: 4,
      hoverBackgroundColor: '#1ed760',
      hoverBorderColor: '#ffffff',
      hoverBorderWidth: 1,
    }],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 400,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#191414',
        titleColor: '#1DB954',
        bodyColor: '#ffffff',
        callbacks: {
          label: (context) => ` Importância: ${context.raw.toFixed(4)}`
        }
      }
    },
    scales: {
      x: { 
        grid: { color: '#343333ff' },
        ticks: { color: '#b3b3b3', font: { weight: 'normal' } } 
      },
      y: { 
        ticks: { 
          color: '#ffffff', 
          font: { size: 12, weight: 'normal' },
          padding: 10
        } 
      }
    }
  };

  return (
    <div style={{ height: '350px', width: '100%', position: 'relative' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}