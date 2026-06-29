import { describe, expect, it, vi } from 'vitest'
import { fetchConcurso, fetchNovos, fetchUltimo } from './caixa'
import type { CaixaConcursoRaw } from '../types'

function resposta(raw: CaixaConcursoRaw) {
  return { ok: true, status: 200, json: async () => raw } as Response
}

const rawUltimo: CaixaConcursoRaw = {
  numero: 5,
  dataApuracao: '27/06/2026',
  listaDezenas: ['13', '39', '42', '44', '47', '49'],
  numeroConcursoProximo: 6,
}

describe('api/caixa', () => {
  it('fetchUltimo parseia a resposta', async () => {
    const fetchImpl = vi.fn(async () => resposta(rawUltimo))
    const c = await fetchUltimo({ fetchImpl: fetchImpl as unknown as typeof fetch })
    expect(c.numero).toBe(5)
    expect(c.dezenas).toEqual([13, 39, 42, 44, 47, 49])
  })

  it('faz retry com backoff e tem sucesso na tentativa seguinte', async () => {
    let chamada = 0
    const fetchImpl = vi.fn(async () => {
      chamada++
      if (chamada === 1) throw new Error('falha de rede transitória')
      return resposta(rawUltimo)
    })
    const c = await fetchConcurso(5, {
      fetchImpl: fetchImpl as unknown as typeof fetch,
      baseBackoffMs: 1,
    })
    expect(chamada).toBe(2)
    expect(c.numero).toBe(5)
  })

  it('desiste após maxTentativas', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('sempre falha')
    })
    await expect(
      fetchConcurso(5, {
        fetchImpl: fetchImpl as unknown as typeof fetch,
        baseBackoffMs: 1,
        maxTentativas: 2,
      }),
    ).rejects.toThrow()
    expect(fetchImpl).toHaveBeenCalledTimes(3) // tentativa 0,1,2
  })

  it('fetchNovos busca só concursos > ultimoCacheado', async () => {
    const porNumero = (n: number): CaixaConcursoRaw => ({
      numero: n,
      dataApuracao: `d${n}`,
      listaDezenas: ['1', '2', '3', '4', '5', '6'],
      numeroConcursoProximo: n + 1,
    })
    const fetchImpl = vi.fn(async (url: string) => {
      // sem sufixo -> último (5); com /n -> concurso n
      const m = String(url).match(/megasena\/(\d+)$/)
      return resposta(m ? porNumero(Number(m[1])) : rawUltimo)
    })
    const novos = await fetchNovos(2, {
      fetchImpl: fetchImpl as unknown as typeof fetch,
      concorrencia: 2,
    })
    expect(novos.map((c) => c.numero)).toEqual([3, 4, 5])
  })

  it('fetchNovos retorna vazio quando já está atualizado', async () => {
    const fetchImpl = vi.fn(async () => resposta(rawUltimo))
    const novos = await fetchNovos(5, { fetchImpl: fetchImpl as unknown as typeof fetch })
    expect(novos).toEqual([])
  })
})
