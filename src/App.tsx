import { useMemo, useState } from 'react'
import Controls from './components/Controls'
import Dashboard from './components/Dashboard'
import SuggestedGames from './components/SuggestedGames'
import { useConcursos } from './hooks/useConcursos'
import { seedMeta } from './data/seed'
import { calcularMetricas } from './stats/metrics'
import type { Janela } from './types'

export default function App() {
  const { status, concursos, origem, novos, progresso, erro } = useConcursos()
  const [janela, setJanela] = useState<Janela>('tudo')

  const metricas = useMemo(
    () => (concursos.length ? calcularMetricas(concursos, janela) : null),
    [concursos, janela],
  )

  return (
    <main>
      <header className="cabecalho">
        <h1>Mega-Sena · Gerenciador de Jogos</h1>
        <p className="subtitulo">
          Dashboard estatístico + gerador de jogos com critérios transparentes.
        </p>
      </header>

      {status === 'carregando' && (
        <div className="estado estado--carregando">
          <div className="spinner" aria-hidden />
          <div>
            <strong>Carregando histórico…</strong>
            {progresso ? (
              <p className="muted">
                Buscando concursos novos: {progresso.feito}/{progresso.total}
              </p>
            ) : (
              <p className="muted">
                Populando do seed de arquivo ({seedMeta.total} concursos) e cacheando localmente.
              </p>
            )}
          </div>
        </div>
      )}

      {status === 'erro' && (
        <div className="estado estado--erro" role="alert">
          <strong>Não foi possível carregar os dados.</strong>
          <p className="muted">{erro}</p>
        </div>
      )}

      {status === 'pronto' && metricas && (
        <>
          <div className="barra-status">
            <span>
              {origem === 'seed' ? 'Histórico carregado do seed' : 'Histórico do cache local'} ·{' '}
              {concursos.length} concursos
              {novos > 0 && ` · ${novos} novo(s) via API`}
            </span>
            <Controls janela={janela} onJanela={setJanela} totalConcursos={concursos.length} />
          </div>

          <Dashboard metricas={metricas} />
          <SuggestedGames metricas={metricas} janela={janela} />
        </>
      )}

      <footer className="rodape">
        <p className="muted">
          Fonte: {seedMeta.fonte}. Atualização incremental via API oficial (proxy de dev).
        </p>
      </footer>
    </main>
  )
}
