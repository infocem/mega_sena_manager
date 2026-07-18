import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

// Carregamento sob demanda das páginas de loteria (escalável para novas modalidades)
const MegaSenaPage = lazy(() => import('./pages/MegaSenaPage'))
const LotofacilPage = lazy(() => import('./pages/LotofacilPage'))

// Fallback exibido enquanto o chunk da rota é carregado
function CarregandoRota() {
  return (
    <div className="estado estado--carregando" role="status" aria-live="polite">
      <div className="spinner" aria-hidden />
      <span>Carregando página…</span>
    </div>
  )
}

/**
 * Configuração central de rotas do LotoHub.
 * - A raiz redireciona para /megasena (página padrão do hub).
 * - Cada loteria é carregada via React.lazy para divisão de chunks.
 * - Suspense envolve as rotas e exibe um fallback de carregamento.
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<CarregandoRota />}>
        <Routes>
          <Route path="/" element={<Navigate to="/megasena" replace />} />
          <Route path="/megasena" element={<MegaSenaPage />} />
          <Route path="/lotofacil" element={<LotofacilPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
