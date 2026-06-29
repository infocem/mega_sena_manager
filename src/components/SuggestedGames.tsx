// Jogos sugeridos (US-005): lista de N jogos com explicação por jogo, controles
// de pesos/quantidade e botão Regenerar. Aviso de honestidade estatística sempre
// visível — o produto diversifica seleções, NÃO prevê resultados.
import { useMemo, useState } from 'react'
import { gerarJogos } from '../engine/generator'
import type { Janela, Metricas, Pesos } from '../types'

interface Props {
  metricas: Metricas
  janela: Janela
}

const PESOS_INICIAIS: Pesos = { quentes: 40, atrasadas: 40, aleatorio: 20 }

export default function SuggestedGames({ metricas, janela }: Props) {
  const [pesos, setPesos] = useState<Pesos>(PESOS_INICIAIS)
  const [qtd, setQtd] = useState(5)
  const [semente, setSemente] = useState(1)

  const { jogos, relaxamentoMaximo } = useMemo(
    () =>
      gerarJogos(metricas, {
        qtdJogos: qtd,
        janela,
        pesos,
        // a semente muda a cada "Regenerar"; combinada com a janela mantém
        // reprodutibilidade dentro do mesmo estado.
        seed: semente * 1000003,
      }),
    [metricas, pesos, qtd, semente, janela],
  )

  const ajustarPeso = (chave: keyof Pesos, valor: number) =>
    setPesos((p) => ({ ...p, [chave]: valor }))

  return (
    <section className="suggested">
      <h2>Jogos sugeridos</h2>

      <div className="aviso" role="note">
        <strong>Aviso de honestidade estatística.</strong> A Mega-Sena é um sorteio
        aleatório de variáveis independentes. <strong>Nenhuma análise aumenta a
        probabilidade real de acerto</strong> (~1 em 50 milhões por jogo de 6 dezenas).
        Estes jogos são uma <em>estratégia de seleção/diversificação transparente</em>,
        não uma previsão.
      </div>

      <div className="gerador-controles">
        <div className="peso">
          <label>
            Quentes <span>{pesos.quentes}</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={pesos.quentes}
            onChange={(e) => ajustarPeso('quentes', Number(e.target.value))}
          />
        </div>
        <div className="peso">
          <label>
            Atrasadas <span>{pesos.atrasadas}</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={pesos.atrasadas}
            onChange={(e) => ajustarPeso('atrasadas', Number(e.target.value))}
          />
        </div>
        <div className="peso">
          <label>
            Aleatório <span>{pesos.aleatorio}</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={pesos.aleatorio}
            onChange={(e) => ajustarPeso('aleatorio', Number(e.target.value))}
          />
        </div>
        <div className="peso peso--qtd">
          <label htmlFor="qtd">Qtde. de jogos</label>
          <input
            id="qtd"
            type="number"
            min={1}
            max={20}
            value={qtd}
            onChange={(e) => setQtd(Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
          />
        </div>
        <button className="btn-regenerar" onClick={() => setSemente((s) => s + 1)}>
          Regenerar
        </button>
      </div>

      {relaxamentoMaximo > 0 && (
        <p className="muted">
          Alguns filtros foram relaxados por escassez de candidatos válidos com os pesos atuais.
        </p>
      )}

      <ol className="jogos">
        {jogos.map((j, i) => (
          <li key={i} className="jogo">
            <div className="jogo__dezenas">
              {j.dezenas.map((d) => (
                <span key={d} className="bola">
                  {String(d).padStart(2, '0')}
                </span>
              ))}
              <span className="jogo__criterio">{j.criterio}</span>
            </div>
            <p className="jogo__explicacao">{j.explicacao}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
