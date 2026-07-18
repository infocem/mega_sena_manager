import { useMemo, useState } from 'react'
import Controls from '../components/Controls'
import Dashboard from '../components/Dashboard'
import SuggestedGames from '../components/SuggestedGames'
import { LotteryTabs } from '../components/layout/lottery-tabs'
import { lotofacilConfig } from '../config/lotofacil'
import { useConcursos } from '../hooks/useConcursos'
import { calcularMetricas } from '../stats/metrics'
import type { Janela } from '../types'

export default function LotofacilPage() {
  const { status, concursos, origem, novos, progresso, erro } = useConcursos(lotofacilConfig.id)
  const [janela, setJanela] = useState<Janela>('tudo')

  const metricas = useMemo(
    () => (concursos.length ? calcularMetricas(concursos, janela) : null),
    [concursos, janela],
  )

  return (
    <main>
      <LotteryTabs />

      <header className="cabecalho">
        <h1>{lotofacilConfig.nome} · Gerenciador de Jogos</h1>
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
                Populando do seed de arquivo e cacheando localmente.
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
            <Controls
              janela={janela}
              onJanela={setJanela}
              totalConcursos={concursos.length}
              config={lotofacilConfig}
            />
          </div>

          <Dashboard metricas={metricas} config={lotofacilConfig} />
          <SuggestedGames metricas={metricas} janela={janela} config={lotofacilConfig} />
        </>
      )}

      <footer className="rodape">
        <p className="muted">
          Fonte: concurso oficial da Caixa. Atualização incremental via API oficial (proxy de dev).
        </p>
      </footer>
    </main>
  )
}
