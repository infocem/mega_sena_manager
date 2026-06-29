import { describe, expect, it, vi } from 'vitest'
import { carregarConcursos } from './cache'
import type { Concurso } from '../types'

function mk(numero: number): Concurso {
  return { numero, data: `d${numero}`, dezenas: [1, 2, 3, 4, 5, 6] }
}

describe('cache / carregarConcursos', () => {
  it('na primeira carga popula do seed e persiste no cache', async () => {
    const store = new Map<string, Concurso[]>()
    const seed = vi.fn(() => [mk(1), mk(2), mk(3)])
    const buscarNovos = vi.fn(async () => [])

    const res = await carregarConcursos(
      {},
      {
        getCache: async (c) => store.get(c),
        setCache: async (c, v) => void store.set(c, v),
        seed,
        buscarNovos,
      },
    )

    expect(res.origem).toBe('seed')
    expect(res.concursos.map((c) => c.numero)).toEqual([1, 2, 3])
    expect(seed).toHaveBeenCalledOnce()
    // persistiu
    expect([...store.values()][0].map((c) => c.numero)).toEqual([1, 2, 3])
  })

  it('com cache existente NÃO usa seed e busca só concursos novos', async () => {
    const store = new Map<string, Concurso[]>()
    store.set('megasena:concursos:v1', [mk(1), mk(2), mk(3)])
    const seed = vi.fn(() => {
      throw new Error('seed não deveria ser chamado')
    })
    const buscarNovos = vi.fn(async (ultimo: number) => {
      expect(ultimo).toBe(3) // pediu só a partir do último cacheado
      return [mk(4), mk(5)]
    })

    const res = await carregarConcursos(
      {},
      {
        getCache: async (c) => store.get(c),
        setCache: async (c, v) => void store.set(c, v),
        seed,
        buscarNovos,
      },
    )

    expect(res.origem).toBe('cache')
    expect(res.novos).toBe(2)
    expect(res.concursos.map((c) => c.numero)).toEqual([1, 2, 3, 4, 5])
    expect(seed).not.toHaveBeenCalled()
    expect(buscarNovos).toHaveBeenCalledOnce()
  })

  it('deduplica e mantém ordem quando novos sobrepõem cache', async () => {
    const store = new Map<string, Concurso[]>()
    store.set('megasena:concursos:v1', [mk(1), mk(2)])
    const res = await carregarConcursos(
      {},
      {
        getCache: async (c) => store.get(c),
        setCache: async (c, v) => void store.set(c, v),
        seed: () => [],
        buscarNovos: async () => [mk(2), mk(3)],
      },
    )
    expect(res.concursos.map((c) => c.numero)).toEqual([1, 2, 3])
  })

  it('sem rede (buscarNovos lança) segue com o cache/seed existente', async () => {
    const store = new Map<string, Concurso[]>()
    const res = await carregarConcursos(
      {},
      {
        getCache: async (c) => store.get(c),
        setCache: async (c, v) => void store.set(c, v),
        seed: () => [mk(1), mk(2)],
        buscarNovos: async () => {
          throw new Error('offline')
        },
      },
    )
    expect(res.concursos.map((c) => c.numero)).toEqual([1, 2])
    expect(res.novos).toBe(0)
  })
})
