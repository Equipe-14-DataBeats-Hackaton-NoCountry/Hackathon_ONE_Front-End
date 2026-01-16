/**
 * Componente raiz da aplicação ChurnInsight.
 *
 * Renderiza o dashboard principal que contém:
 * - Formulário de predição individual
 * - Upload em lote
 * - Dashboard com gráficos e métricas
 * - Busca de clientes pré-calculados
 *
 * @component
 * @returns {JSX.Element} Aplicação renderizada
 */

import Dashboard from './pages/Dashboard'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Dashboard />
      <Footer />
    </>
  )
}
