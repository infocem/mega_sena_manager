// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import SuggestedGames from './SuggestedGames'
import type { Metricas } from '../types'

afterEach(cleanup)

function metricas(): Metricas {
  return {
    totalConcursos: 100,
    frequencia: Array.from({ length: 60 }, (_, i) => ({ dezena: i + 1, contagem: (i % 7) + 1 })),
    atraso: Array.from({ length: 60 }, (_, i) => ({ dezena: i + 1, atraso: (i % 5) + 1 })),
    parImpar: [],
    soma: { min: 21, max: 345, media: 183, mediana: 183, p10: 100, p90: 250 },
    distribuicao: { linhas: [], colunas: [] },
  }
}

describe('<SuggestedGames>', () => {
  it('exibe o aviso de honestidade estatística (sem linguagem de previsão)', () => {
    render(<SuggestedGames metricas={metricas()} janela="tudo" />)
    expect(screen.getByText(/honestidade estatística/i)).toBeTruthy()
    expect(screen.getByText(/Nenhuma análise aumenta a/i)).toBeTruthy()
  })

  it('lista 5 jogos com 6 dezenas cada', () => {
    const { container } = render(<SuggestedGames metricas={metricas()} janela="tudo" />)
    const jogos = container.querySelectorAll('li.jogo')
    expect(jogos).toHaveLength(5)
    jogos.forEach((j) => {
      expect(j.querySelectorAll('.bola')).toHaveLength(6)
    })
    expect(container.querySelectorAll('.jogo__explicacao').length).toBe(5)
  })

  it('botão Regenerar produz um novo conjunto de jogos', () => {
    const { container } = render(<SuggestedGames metricas={metricas()} janela="tudo" />)
    const antes = [...container.querySelectorAll('li.jogo')].map((j) => j.textContent)
    fireEvent.click(screen.getByRole('button', { name: /regenerar/i }))
    const depois = [...container.querySelectorAll('li.jogo')].map((j) => j.textContent)
    expect(depois).not.toEqual(antes)
  })

  it('ajustar a quantidade muda o número de jogos', () => {
    const { container } = render(<SuggestedGames metricas={metricas()} janela="tudo" />)
    const qtd = screen.getByLabelText(/Qtde\. de jogos/i)
    fireEvent.change(qtd, { target: { value: '3' } })
    expect(container.querySelectorAll('li.jogo')).toHaveLength(3)
  })
})
