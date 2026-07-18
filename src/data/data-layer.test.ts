import { describe, expect, it, vi } from 'vitest'
import {
  CacheKeyManager,
  carregarConcursos,
} from './cache'
import {
  isValidConcurso,
  parseCaixaRaw,
  parseSeedEntries,
  parseSeedEntry,
} from './parser'
import {
  carregarSeedPorLoteria,
  SeedManager,
} from './seed-manager'
import { lotofacilConfig } from '../config/lotofacil'
import { megasenaConfig } from '../config/megasena'
import type { CaixaConcursoRaw, Concurso, SeedEntry } from '../types'

// Mocks dos arquivos seed importados dinamicamente por seed-manager.ts.
// Os caminhos são resolvidos relativamente ao diretório src/data.
vi.mock('./megasena-seed.json', () => ({
  default: {
    fonte: 'mock-megasena',
    ultimo: 2,
    concursos: [
      { n: 1, d: '01/01/2024', z: [41, 5, 4, 52, 30, 33] },
      { n: 2, d: '02/01/2024', z: [10, 20, 30, 40, 50, 60] },
    ],
  },
}))

vi.mock('./lotofacil-seed.json', () => ({
  default: {
    fonte: 'mock-lotofacil',
    ultimo: 1,
    concursos: [
      {
        n: 1,
        d: '01/01/2024',
        z: [25, 1, 15, 10, 5, 20, 2, 14, 9, 4, 19, 8, 13, 3, 18],
      },
    ],
  },
}))

function mk(numero: number): Concurso {
  return { numero, data: `d${numero}`, dezenas: [1, 2, 3, 4, 5, 6] }
}

describe('parser com config', () => {
  it('isValidConcurso aceita config da Mega-Sena por padrão', () => {
    expect(
      isValidConcurso({ numero: 1, data: 'x', dezenas: [1, 2, 3, 4, 5, 6] }),
    ).toBe(true)
    expect(
      isValidConcurso({ numero: 1, data: 'x', dezenas: [1, 2, 3, 4, 5] }),
    ).toBe(false)
    expect(
      isValidConcurso({ numero: 1, data: 'x', dezenas: [1, 2, 3, 4, 5, 61] }),
    ).toBe(false)
  })

  it('isValidConcurso valida Lotofácil (15-20 dezenas, faixa 1-25)', () => {
    const valido15: Concurso = {
      numero: 1,
      data: 'x',
      dezenas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    }
    const valido20: Concurso = {
      numero: 2,
      data: 'x',
      dezenas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    }
    const invalido14: Concurso = {
      numero: 3,
      data: 'x',
      dezenas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    }
    const invalido26: Concurso = {
      numero: 4,
      data: 'x',
      dezenas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 26],
    }
    const invalidoRepetida: Concurso = {
      numero: 5,
      data: 'x',
      dezenas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15],
    }

    expect(isValidConcurso(valido15, lotofacilConfig)).toBe(true)
    expect(isValidConcurso(valido20, lotofacilConfig)).toBe(true)
    expect(isValidConcurso(invalido14, lotofacilConfig)).toBe(false)
    expect(isValidConcurso(invalido26, lotofacilConfig)).toBe(false)
    expect(isValidConcurso(invalidoRepetida, lotofacilConfig)).toBe(false)
  })

  it('parseSeedEntry usa config informada e ordena as dezenas', () => {
    const mega: SeedEntry = { n: 1, d: 'x', z: [41, 5, 4, 52, 30, 33] }
    const loto: SeedEntry = {
      n: 2,
      d: 'x',
      z: [25, 1, 15, 10, 5, 20, 2, 14, 9, 4, 19, 8, 13, 3, 18],
    }

    expect(parseSeedEntry(mega, megasenaConfig)?.dezenas).toEqual([
      4, 5, 30, 33, 41, 52,
    ])
    expect(parseSeedEntry(loto, lotofacilConfig)?.dezenas).toEqual([
      1, 2, 3, 4, 5, 8, 9, 10, 13, 14, 15, 18, 19, 20, 25,
    ])
    // Sem config, Mega-Sena é o padrão: entrada de Lotofácil deve ser rejeitada.
    expect(parseSeedEntry(loto)).toBeNull()
  })

  it('parseCaixaRaw usa config informada e ordena as dezenas', () => {
    const mega: CaixaConcursoRaw = {
      numero: 1,
      dataApuracao: '01/01/2024',
      listaDezenas: ['13', '39', '42', '44', '47', '49'],
      numeroConcursoProximo: null,
    }
    const loto: CaixaConcursoRaw = {
      numero: 2,
      dataApuracao: '02/01/2024',
      listaDezenas: ['25', '1', '15', '10', '5', '20', '2', '14', '9', '4', '19', '8', '13', '3', '18'],
      numeroConcursoProximo: null,
    }

    expect(parseCaixaRaw(mega, megasenaConfig)?.dezenas).toEqual([
      13, 39, 42, 44, 47, 49,
    ])
    expect(parseCaixaRaw(loto, lotofacilConfig)?.dezenas).toEqual([
      1, 2, 3, 4, 5, 8, 9, 10, 13, 14, 15, 18, 19, 20, 25,
    ])
    // Sem config, Mega-Sena é o padrão: entrada de Lotofácil deve ser rejeitada.
    expect(parseCaixaRaw(loto)).toBeNull()
  })

  it('parseSeedEntries descarta inválidos conforme config e ordena por número', () => {
    const entries: SeedEntry[] = [
      { n: 3, d: 'c', z: [1, 2, 3, 4, 5, 6] },
      { n: 1, d: 'a', z: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
      { n: 2, d: 'b', z: [1, 2, 3] },
    ]

    const mega = parseSeedEntries(entries, megasenaConfig)
    expect(mega.map((c) => c.numero)).toEqual([3])
    expect(mega[0].dezenas).toEqual([1, 2, 3, 4, 5, 6])

    const loto = parseSeedEntries(entries, lotofacilConfig)
    expect(loto.map((c) => c.numero)).toEqual([1])
    expect(loto[0].dezenas).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    ])
  })

  it('mantém compatibilidade quando config não é informada (Mega-Sena padrão)', () => {
    const entry: SeedEntry = { n: 1, d: 'x', z: [41, 5, 4, 52, 30, 33] }
    const raw: CaixaConcursoRaw = {
      numero: 1,
      dataApuracao: 'x',
      listaDezenas: ['13', '39', '42', '44', '47', '49'],
      numeroConcursoProximo: null,
    }

    expect(parseSeedEntry(entry)).toEqual(parseSeedEntry(entry, megasenaConfig))
    expect(parseCaixaRaw(raw)).toEqual(parseCaixaRaw(raw, megasenaConfig))
    expect(
      isValidConcurso({ numero: 1, data: 'x', dezenas: [1, 2, 3, 4, 5, 6] }),
    ).toBe(
      isValidConcurso(
        { numero: 1, data: 'x', dezenas: [1, 2, 3, 4, 5, 6] },
        megasenaConfig,
      ),
    )
  })
})

describe('cache com chaves por loteria', () => {
  it('CacheKeyManager.chaveConcursos gera chave no formato esperado', () => {
    expect(CacheKeyManager.chaveConcursos('megasena')).toBe(
      'megasena:concursos:v1',
    )
    expect(CacheKeyManager.chaveConcursos('lotofacil')).toBe(
      'lotofacil:concursos:v1',
    )
  })

  it('IDs de loteria diferentes produzem chaves diferentes', () => {
    const chaves = new Set([
      CacheKeyManager.chaveConcursos('megasena'),
      CacheKeyManager.chaveConcursos('lotofacil'),
      CacheKeyManager.chaveConcursos('quina'),
    ])
    expect(chaves.size).toBe(3)
  })

  it('carregarConcursos usa loteriaId na chave de cache', async () => {
    const store = new Map<string, Concurso[]>()
    const seed = vi.fn(() => [mk(1)])
    const buscarNovos = vi.fn(async () => [])

    const res = await carregarConcursos(
      { loteriaId: 'lotofacil' },
      {
        getCache: async (c) => store.get(c),
        setCache: async (c, v) => void store.set(c, v),
        seed,
        buscarNovos,
      },
    )

    expect(res.origem).toBe('seed')
    expect([...store.keys()]).toEqual(['lotofacil:concursos:v1'])
    expect(seed).toHaveBeenCalledOnce()
  })

  it('carregarConcursos isola caches de loterias diferentes', async () => {
    const store = new Map<string, Concurso[]>()
    const seedMega = vi.fn(() => [mk(1)])
    const seedLoto = vi.fn(() => [mk(2)])

    await carregarConcursos(
      { loteriaId: 'megasena' },
      {
        getCache: async (c) => store.get(c),
        setCache: async (c, v) => void store.set(c, v),
        seed: seedMega,
        buscarNovos: async () => [],
      },
    )
    await carregarConcursos(
      { loteriaId: 'lotofacil' },
      {
        getCache: async (c) => store.get(c),
        setCache: async (c, v) => void store.set(c, v),
        seed: seedLoto,
        buscarNovos: async () => [],
      },
    )

    expect(store.get('megasena:concursos:v1')?.map((c) => c.numero)).toEqual([1])
    expect(store.get('lotofacil:concursos:v1')?.map((c) => c.numero)).toEqual([2])
    expect(seedMega).toHaveBeenCalledOnce()
    expect(seedLoto).toHaveBeenCalledOnce()
  })

  it('mantém compatibilidade quando loteriaId não é informado (megasena padrão)', async () => {
    const store = new Map<string, Concurso[]>()
    const seed = vi.fn(() => [mk(1)])

    const res = await carregarConcursos(
      {},
      {
        getCache: async (c) => store.get(c),
        setCache: async (c, v) => void store.set(c, v),
        seed,
        buscarNovos: async () => [],
      },
    )

    expect(res.origem).toBe('seed')
    expect([...store.keys()]).toEqual(['megasena:concursos:v1'])
  })
})

describe('seed manager', () => {
  it('carrega Mega-Sena com config correta', async () => {
    const manager = new SeedManager()
    const concursos = await manager.carregar('megasena')

    expect(concursos.length).toBe(2)
    expect(concursos[0].numero).toBe(1)
    expect(concursos[0].dezenas).toEqual([4, 5, 30, 33, 41, 52])
    expect(concursos[1].dezenas).toEqual([10, 20, 30, 40, 50, 60])
  })

  it('carrega Lotofácil com config correta', async () => {
    const manager = new SeedManager()
    const concursos = await manager.carregar('lotofacil')

    expect(concursos.length).toBe(1)
    expect(concursos[0].numero).toBe(1)
    expect(concursos[0].dezenas).toEqual([
      1, 2, 3, 4, 5, 8, 9, 10, 13, 14, 15, 18, 19, 20, 25,
    ])
  })

  it('carregarSeedPorLoteria é facade sobre SeedManager', async () => {
    const concursos = await carregarSeedPorLoteria('megasena')

    expect(concursos.length).toBe(2)
    expect(concursos[0].numero).toBe(1)
  })

  it('rejeita ID de loteria não suportado', async () => {
    const manager = new SeedManager()

    await expect(manager.carregar('quina')).rejects.toThrow(
      'Loteria não suportada: "quina"',
    )
  })

  it('segunda chamada usa cache em memória (mesma referência)', async () => {
    const manager = new SeedManager()

    const primeiro = await manager.carregar('megasena')
    const segundo = await manager.carregar('megasena')

    expect(segundo).toBe(primeiro)
  })

  it('limparCache por loteria força recarregamento', async () => {
    const manager = new SeedManager()

    const primeiro = await manager.carregar('megasena')
    manager.limparCache('megasena')
    const segundo = await manager.carregar('megasena')

    expect(segundo).not.toBe(primeiro)
    expect(segundo).toEqual(primeiro)
  })

  it('limparCache sem argumento limpa todo o cache', async () => {
    const manager = new SeedManager()

    const mega1 = await manager.carregar('megasena')
    const loto1 = await manager.carregar('lotofacil')
    manager.limparCache()
    const mega2 = await manager.carregar('megasena')
    const loto2 = await manager.carregar('lotofacil')

    expect(mega2).not.toBe(mega1)
    expect(loto2).not.toBe(loto1)
    expect(mega2).toEqual(mega1)
    expect(loto2).toEqual(loto1)
  })
})
