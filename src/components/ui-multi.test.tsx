// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { LotteryTabs } from '../components/layout/lottery-tabs'
import { AppRouter } from '../router'
import Dashboard from '../components/Dashboard'
import Controls from '../components/Controls'
import SuggestedGames from '../components/SuggestedGames'
import { megasenaConfig } from '../config/megasena'
import { lotofacilConfig } from '../config/lotofacil'
import { calcularMetricas } from '../stats/metrics'
import type { Concurso, Metricas } from '../types'

// Mock das páginas para isolar os testes de roteamento do hook de dados.
vi.mock('../pages/MegaSenaPage', () => ({
  default: () => <div data-testid="pagina-megasena">Página Mega-Sena</div>,
}))

vi.mock('../pages/LotofacilPage', () => ({
  default: () => <div data-testid="pagina-lotofacil">Página Lotofácil</div>,
}))

afterEach(cleanup)

const CONCURSOS_MOCK: Concurso[] = [
  { numero: 1, data: '01/01/2020', dezenas: [1, 2, 3, 4, 5, 6] },
  { numero: 2, data: '02/01/2020', dezenas: [10, 20, 30, 40, 50, 60] },
  { numero: 3, data: '03/01/2020', dezenas: [5, 15, 25, 35, 45, 55] },
]

function metricasMegaSena(): Metricas {
  return {
    totalConcursos: 100,
    frequencia: Array.from({ length: 60 }, (_, i) => ({ dezena: i + 1, contagem: (i % 7) + 1 })),
    atraso: Array.from({ length: 60 }, (_, i) => ({ dezena: i + 1, atraso: (i % 5) + 1 })),
    parImpar: Array.from({ length: 7 }, (_, i) => ({ pares: i, contagem: i === 3 ? 30 : 10 })),
    soma: { min: 21, max: 345, media: 183, mediana: 183, p10: 100, p90: 250 },
    distribuicao: { linhas: [], colunas: [] },
  }
}

function metricasLotofacil(): Metricas {
  return {
    totalConcursos: 50,
    frequencia: Array.from({ length: 25 }, (_, i) => ({ dezena: i + 1, contagem: (i % 5) + 1 })),
    atraso: Array.from({ length: 25 }, (_, i) => ({ dezena: i + 1, atraso: (i % 4) + 1 })),
    parImpar: Array.from({ length: 16 }, (_, i) => ({ pares: i, contagem: i === 7 ? 20 : 5 })),
    soma: { min: 150, max: 300, media: 200, mediana: 200, p10: 160, p90: 260 },
    distribuicao: { linhas: [], colunas: [] },
  }
}

function IndicadorDeRota() {
  const { pathname } = useLocation()
  return <span data-testid="rota-atual">{pathname}</span>
}

describe('<LotteryTabs>', () => {
  it('renderiza as abas da Mega-Sena e da Lotofácil', () => {
    render(
      <MemoryRouter initialEntries={['/megasena']}>
        <LotteryTabs />
      </MemoryRouter>,
    )
    expect(screen.getByRole('tab', { name: /Mega-Sena/i })).toBeTruthy()
    expect(screen.getByRole('tab', { name: /Lotofácil/i })).toBeTruthy()
  })

  it('destaca a aba Mega-Sena em /megasena', () => {
    render(
      <MemoryRouter initialEntries={['/megasena']}>
        <LotteryTabs />
      </MemoryRouter>,
    )
    const abaMega = screen.getByRole('tab', { name: /Mega-Sena/i })
    const abaLoto = screen.getByRole('tab', { name: /Lotofácil/i })
    expect(abaMega.classList.contains('lottery-tabs__tab--active')).toBe(true)
    expect(abaLoto.classList.contains('lottery-tabs__tab--active')).toBe(false)
  })

  it('destaca a aba Lotofácil em /lotofacil', () => {
    render(
      <MemoryRouter initialEntries={['/lotofacil']}>
        <LotteryTabs />
      </MemoryRouter>,
    )
    const abaMega = screen.getByRole('tab', { name: /Mega-Sena/i })
    const abaLoto = screen.getByRole('tab', { name: /Lotofácil/i })
    expect(abaMega.classList.contains('lottery-tabs__tab--active')).toBe(false)
    expect(abaLoto.classList.contains('lottery-tabs__tab--active')).toBe(true)
  })

  it('mantém a aba Mega-Sena ativa para rotas filhas', () => {
    render(
      <MemoryRouter initialEntries={['/megasena/detalhes']}>
        <LotteryTabs />
      </MemoryRouter>,
    )
    expect(screen.getByRole('tab', { name: /Mega-Sena/i }).classList.contains('lottery-tabs__tab--active')).toBe(true)
    expect(screen.getByRole('tab', { name: /Lotofácil/i }).classList.contains('lottery-tabs__tab--active')).toBe(false)
  })

  it('navega para a rota correta ao clicar em uma aba', async () => {
    render(
      <MemoryRouter initialEntries={['/megasena']}>
        <LotteryTabs />
        <IndicadorDeRota />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('tab', { name: /Lotofácil/i }))
    await waitFor(() => {
      expect(screen.getByTestId('rota-atual').textContent).toBe('/lotofacil')
    })
  })

  it('expõe atributos ARIA corretos para acessibilidade', () => {
    render(
      <MemoryRouter initialEntries={['/lotofacil']}>
        <LotteryTabs />
      </MemoryRouter>,
    )
    expect(screen.getByRole('tablist')).toBeTruthy()
    const abas = screen.getAllByRole('tab')
    expect(abas).toHaveLength(2)
    const loto = screen.getByRole('tab', { name: /Lotofácil/i })
    const mega = screen.getByRole('tab', { name: /Mega-Sena/i })
    expect(loto.getAttribute('aria-selected')).toBe('true')
    expect(mega.getAttribute('aria-selected')).toBe('false')
    expect(loto.getAttribute('aria-current')).toBe('page')
    expect(mega.getAttribute('aria-current')).toBeNull()
  })
})

describe('Rotas', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/')
  })

  it('redireciona / para /megasena', async () => {
    window.history.pushState({}, '', '/')
    render(<AppRouter />)
    await waitFor(() => {
      expect(screen.getByTestId('pagina-megasena')).toBeTruthy()
    })
  })

  it('/megasena renderiza a página da Mega-Sena', async () => {
    window.history.pushState({}, '', '/megasena')
    render(<AppRouter />)
    await waitFor(() => {
      expect(screen.getByTestId('pagina-megasena')).toBeTruthy()
    })
    expect(screen.queryByTestId('pagina-lotofacil')).toBeNull()
  })

  it('/lotofacil renderiza a página da Lotofácil', async () => {
    window.history.pushState({}, '', '/lotofacil')
    render(<AppRouter />)
    await waitFor(() => {
      expect(screen.getByTestId('pagina-lotofacil')).toBeTruthy()
    })
    expect(screen.queryByTestId('pagina-megasena')).toBeNull()
  })

  it('lazy loading carrega as páginas sob Suspense', async () => {
    window.history.pushState({}, '', '/megasena')
    render(<AppRouter />)
    await waitFor(() => {
      expect(screen.getByTestId('pagina-megasena')).toBeTruthy()
    })
  })
})

describe('Componentes parametrizados', () => {
  describe('<Dashboard>', () => {
    it('renderiza com megasenaConfig', () => {
      render(<Dashboard metricas={calcularMetricas(CONCURSOS_MOCK, 'tudo')} config={megasenaConfig} />)
      expect(screen.getByText(/Frequência por dezena/i)).toBeTruthy()
      expect(screen.getByText(/Distribuição par\/ímpar/i)).toBeTruthy()
      expect(screen.getByText(/Maiores atrasos/i)).toBeTruthy()
      expect(screen.getByText(/Soma das dezenas/i)).toBeTruthy()
      expect(screen.getByText(/3 concursos/i)).toBeTruthy()
    })

    it('renderiza com lotofacilConfig e usa dezenasMin nos rótulos', () => {
      render(<Dashboard metricas={metricasLotofacil()} config={lotofacilConfig} />)
      expect(screen.getByText(/Frequência por dezena/i)).toBeTruthy()
      expect(screen.getByText(/Distribuição par\/ímpar/i)).toBeTruthy()
      expect(screen.getByText(/Destaque: 7 pares \+ 8 ímpares \(equilíbrio\)/i)).toBeTruthy()
    })
  })

  describe('<Controls>', () => {
    it('renderiza com megasenaConfig', () => {
      render(<Controls janela="tudo" onJanela={() => {}} totalConcursos={100} config={megasenaConfig} />)
      expect(screen.getByText(/Janela de análise/i)).toBeTruthy()
      expect(screen.getByRole('button', { name: /Tudo/i }).getAttribute('aria-pressed')).toBe('true')
      expect(screen.getByText(/100 concursos/i)).toBeTruthy()
    })

    it('renderiza com lotofacilConfig', () => {
      render(<Controls janela={50} onJanela={() => {}} totalConcursos={50} config={lotofacilConfig} />)
      expect(screen.getByRole('button', { name: '50' }).getAttribute('aria-pressed')).toBe('true')
      expect(screen.getByText(/últimos 50 concursos/i)).toBeTruthy()
    })
  })

  describe('<SuggestedGames>', () => {
    it('renderiza com megasenaConfig', () => {
      const { container } = render(<SuggestedGames metricas={metricasMegaSena()} janela="tudo" config={megasenaConfig} />)
      expect(screen.getByText(/Aviso de honestidade estatística/i)).toBeTruthy()
      const jogos = container.querySelectorAll('li.jogo')
      expect(jogos).toHaveLength(5)
      jogos.forEach((j) => {
        expect(j.querySelectorAll('.bola')).toHaveLength(6)
      })
    })

    it('renderiza com lotofacilConfig', () => {
      const { container } = render(<SuggestedGames metricas={metricasLotofacil()} janela="tudo" config={lotofacilConfig} />)
      expect(screen.getByText(/Aviso de honestidade estatística/i)).toBeTruthy()
      const jogos = container.querySelectorAll('li.jogo')
      expect(jogos).toHaveLength(5)
      jogos.forEach((j) => {
        expect(j.querySelectorAll('.bola')).toHaveLength(15)
      })
    })

    it('passa a config para gerarJogos (15 dezenas na Lotofácil)', () => {
      const { container } = render(<SuggestedGames metricas={metricasLotofacil()} janela="tudo" config={lotofacilConfig} />)
      const bolas = container.querySelectorAll('li.jogo .bola')
      expect(bolas).toHaveLength(5 * 15)
    })

    it('exibe o texto de probabilidade correto para a Mega-Sena', () => {
      render(<SuggestedGames metricas={metricasMegaSena()} janela="tudo" config={megasenaConfig} />)
      expect(screen.getByText(/~1 em 50\.063\.860 por jogo de 6 dezenas/i)).toBeTruthy()
    })

    it('exibe o texto de probabilidade correto para a Lotofácil', () => {
      render(<SuggestedGames metricas={metricasLotofacil()} janela="tudo" config={lotofacilConfig} />)
      expect(screen.getByText(/~1 em 3\.268\.760 por jogo de 15 dezenas/i)).toBeTruthy()
    })
  })
})
