// Seletor de janela de análise (US-004). Recalcular métricas é responsabilidade
// do App, que recomputa ao mudar a janela.
import { megasenaConfig } from '../config/megasena'
import type { LoteriaConfig } from '../config/loterias'
import type { Janela } from '../types'

const OPCOES: { valor: Janela; rotulo: string }[] = [
  { valor: 50, rotulo: '50' },
  { valor: 100, rotulo: '100' },
  { valor: 500, rotulo: '500' },
  { valor: 'tudo', rotulo: 'Tudo' },
]

interface Props {
  janela: Janela
  onJanela: (j: Janela) => void
  totalConcursos: number
  config?: LoteriaConfig
}

export default function Controls({
  janela,
  onJanela,
  totalConcursos,
  config: _config = megasenaConfig,
}: Props) {
  return (
    <div className="controls">
      <span className="controls__label">Janela de análise:</span>
      <div className="seg">
        {OPCOES.map((o) => (
          <button
            key={String(o.valor)}
            className={`seg__btn ${janela === o.valor ? 'seg__btn--ativo' : ''}`}
            onClick={() => onJanela(o.valor)}
            aria-pressed={janela === o.valor}
          >
            {o.rotulo}
          </button>
        ))}
      </div>
      <span className="controls__hint">
        {janela === 'tudo' ? `${totalConcursos} concursos` : `últimos ${janela} concursos`}
      </span>
    </div>
  )
}
