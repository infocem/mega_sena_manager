// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import Dashboard from './Dashboard'
import { calcularMetricas } from '../stats/metrics'
import type { Concurso } from '../types'

afterEach(cleanup)

const FIX: Concurso[] = [
  { numero: 1, data: 'a', dezenas: [1, 2, 3, 4, 5, 6] },
  { numero: 2, data: 'b', dezenas: [10, 20, 30, 40, 50, 60] },
  { numero: 3, data: 'c', dezenas: [1, 2, 3, 4, 5, 7] },
  { numero: 4, data: 'd', dezenas: [5, 15, 25, 35, 45, 55] },
]

describe('<Dashboard>', () => {
  it('renderiza os painéis de métricas', () => {
    render(<Dashboard metricas={calcularMetricas(FIX, 'tudo')} />)
    expect(screen.getByText(/Frequência por dezena/i)).toBeTruthy()
    expect(screen.getByText(/Distribuição par\/ímpar/i)).toBeTruthy()
    expect(screen.getByText(/Maiores atrasos/i)).toBeTruthy()
    expect(screen.getByText(/Soma das dezenas/i)).toBeTruthy()
  })

  it('mostra o total de concursos e a soma mínima/máxima corretos', () => {
    const { container } = render(<Dashboard metricas={calcularMetricas(FIX, 'tudo')} />)
    expect(screen.getByText(/4 concursos/i)).toBeTruthy()
    const texto = container.textContent ?? ''
    expect(texto).toContain('21') // soma mínima
    expect(texto).toContain('210') // soma máxima
  })
})
