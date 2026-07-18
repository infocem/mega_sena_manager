// Hook de carregamento: na 1ª carga popula do seed e persiste no IndexedDB;
// recargas buscam só concursos novos via API. Expõe estados de loading/erro.
import { useEffect, useState } from 'react'
import { carregarConcursos } from '../data/cache'
import type { Concurso } from '../types'

export type StatusCarga = 'carregando' | 'pronto' | 'erro'

export interface EstadoConcursos {
  status: StatusCarga
  concursos: Concurso[]
  origem: 'seed' | 'cache' | null
  novos: number
  progresso: { feito: number; total: number } | null
  erro: string | null
}

export function useConcursos(loteriaId?: string): EstadoConcursos {
  const [estado, setEstado] = useState<EstadoConcursos>({
    status: 'carregando',
    concursos: [],
    origem: null,
    novos: 0,
    progresso: null,
    erro: null,
  })

  useEffect(() => {
    let ativo = true
    ;(async () => {
      try {
        const res = await carregarConcursos({
          loteriaId,
          onProgresso: (feito, total) => {
            if (ativo) setEstado((e) => ({ ...e, progresso: { feito, total } }))
          },
        })
        if (!ativo) return
        setEstado({
          status: 'pronto',
          concursos: res.concursos,
          origem: res.origem,
          novos: res.novos,
          progresso: null,
          erro: null,
        })
      } catch (err) {
        if (!ativo) return
        setEstado((e) => ({
          ...e,
          status: 'erro',
          erro: err instanceof Error ? err.message : 'Falha ao carregar concursos',
        }))
      }
    })()
    return () => {
      ativo = false
    }
  }, [loteriaId])

  return estado
}
