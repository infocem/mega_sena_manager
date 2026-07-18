// Dashboard de estatísticas (US-004): frequência, atraso, par/ímpar e soma.
// Descritivo do histórico — sem qualquer alegação de previsão.
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { megasenaConfig } from '../config/megasena'
import type { LoteriaConfig } from '../config/loterias'
import type { Metricas } from '../types'

const ACCENT = '#209869'
const WARN = '#d98324'

interface Props {
  metricas: Metricas
  config?: LoteriaConfig
}

export default function Dashboard({ metricas, config = megasenaConfig }: Props) {
  const freqData = metricas.frequencia.map((f) => ({ dezena: f.dezena, contagem: f.contagem }))
  const topAtraso = [...metricas.atraso].sort((a, b) => b.atraso - a.atraso).slice(0, 12)
  const parImparData = metricas.parImpar.map((p) => ({
    nome: `${p.pares}P/${config.dezenasMin - p.pares}Í`,
    contagem: p.contagem,
  }))
  const paresDestaque = Math.floor(config.dezenasMin / 2)
  const { soma } = metricas

  return (
    <section className="dashboard">
      <h2>
        Estatísticas <small>({metricas.totalConcursos} concursos)</small>
      </h2>

      <div className="grid">
        <div className="panel">
          <h3>Frequência por dezena</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={freqData} margin={{ top: 8, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a" />
              <XAxis dataKey="dezena" tick={{ fontSize: 9 }} interval={4} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#181b22', border: '1px solid #2a2f3a' }}
                formatter={(v: number) => [`${v}x`, 'saiu']}
                labelFormatter={(l) => `Dezena ${l}`}
              />
              <Bar dataKey="contagem" fill={ACCENT} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <h3>Distribuição par/ímpar</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={parImparData} margin={{ top: 8, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a" />
              <XAxis dataKey="nome" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#181b22', border: '1px solid #2a2f3a' }}
                formatter={(v: number) => [`${v} concursos`, '']}
              />
              <Bar dataKey="contagem" fill={ACCENT}>
                {parImparData.map((_, i) => (
                  <Cell key={i} fill={i === paresDestaque ? WARN : ACCENT} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="muted">
            Destaque: {paresDestaque} pares + {config.dezenasMin - paresDestaque} ímpares (equilíbrio).
          </p>
        </div>

        <div className="panel">
          <h3>Maiores atrasos</h3>
          <table className="tabela">
            <thead>
              <tr>
                <th>Dezena</th>
                <th>Atraso (concursos)</th>
              </tr>
            </thead>
            <tbody>
              {topAtraso.map((a) => (
                <tr key={a.dezena}>
                  <td>{String(a.dezena).padStart(2, '0')}</td>
                  <td>{a.atraso}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <h3>Soma das dezenas</h3>
          <ul className="stats-list">
            <li>
              <span>Mínima</span>
              <strong>{soma.min}</strong>
            </li>
            <li>
              <span>Percentil 10</span>
              <strong>{Math.round(soma.p10)}</strong>
            </li>
            <li>
              <span>Média</span>
              <strong>{soma.media.toFixed(1)}</strong>
            </li>
            <li>
              <span>Mediana</span>
              <strong>{Math.round(soma.mediana)}</strong>
            </li>
            <li>
              <span>Percentil 90</span>
              <strong>{Math.round(soma.p90)}</strong>
            </li>
            <li>
              <span>Máxima</span>
              <strong>{soma.max}</strong>
            </li>
          </ul>
          <p className="muted">
            Faixa típica (p10–p90): <strong>{Math.round(soma.p10)}</strong>–
            <strong>{Math.round(soma.p90)}</strong> — usada como filtro do gerador.
          </p>
        </div>
      </div>
    </section>
  )
}
