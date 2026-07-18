import { describe, expect, it } from 'vitest'
import type { FiltrosConfig, LoteriaConfig } from './loterias'
import { validarLoteriaConfig as validarConfigLoteria } from './loterias'
import { lotofacilConfig } from './lotofacil'
import { megasenaConfig } from './megasena'

// --- Validadores runtime que espelham a estrutura das interfaces ---

function validarString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

function validarInteiroPositivo(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

function validarInteiroNaoNegativo(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

function validarSoma(soma: unknown): soma is FiltrosConfig['soma'] {
  if (typeof soma !== 'object' || soma === null) return false
  const s = soma as Record<string, unknown>

  if (typeof s.tipo !== 'string') return false

  if (s.tipo === 'absoluto') {
    if (!validarInteiroPositivo(s.min)) return false
    if (!validarInteiroPositivo(s.max)) return false
    return s.min <= s.max
  }

  if (s.tipo === 'percentil') {
    if (typeof s.minPercentil !== 'number' || typeof s.maxPercentil !== 'number') return false
    if (s.minPercentil < 0 || s.maxPercentil > 1) return false
    return s.minPercentil < s.maxPercentil
  }

  return false
}

function validarFiltrosConfig(filtros: unknown): filtros is FiltrosConfig {
  if (typeof filtros !== 'object' || filtros === null) return false
  const f = filtros as Record<string, unknown>

  if (typeof f.parImpar !== 'object' || f.parImpar === null) return false
  const pi = f.parImpar as Record<string, unknown>
  if (!validarInteiroNaoNegativo(pi.min)) return false
  if (!validarInteiroNaoNegativo(pi.max)) return false
  if (pi.min > pi.max) return false

  if (typeof f.sequenciais !== 'object' || f.sequenciais === null) return false
  const seq = f.sequenciais as Record<string, unknown>
  if (!validarInteiroPositivo(seq.maxConsecutivos)) return false

  if (!validarSoma(f.soma)) return false

  if (typeof f.espalhamento !== 'object' || f.espalhamento === null) return false
  const esp = f.espalhamento as Record<string, unknown>
  if (!validarInteiroPositivo(esp.minLinhas)) return false

  return true
}

function validarLoteriaConfig(config: unknown): config is LoteriaConfig {
  if (typeof config !== 'object' || config === null) return false
  const c = config as Record<string, unknown>

  if (!validarString(c.id)) return false
  if (!validarString(c.nome)) return false

  if (!validarInteiroPositivo(c.dezenasMin)) return false
  if (!validarInteiroPositivo(c.dezenasMax)) return false
  if (c.dezenasMin > c.dezenasMax) return false

  if (!validarInteiroPositivo(c.faixaMin)) return false
  if (!validarInteiroPositivo(c.faixaMax)) return false
  if (c.faixaMin >= c.faixaMax) return false

  if (!validarInteiroPositivo(c.colunas)) return false
  if (!validarInteiroPositivo(c.linhas)) return false

  return validarFiltrosConfig(c.filtros)
}

// --- Testes ---

describe('configuração da Mega-Sena', () => {
  it('exporta o objeto de configuração', () => {
    expect(megasenaConfig).toBeDefined()
  })

  it('possui todos os campos obrigatórios da interface LoteriaConfig', () => {
    expect(validarLoteriaConfig(megasenaConfig)).toBe(true)
  })

  it('identifica corretamente a loteria pelo id e nome', () => {
    expect(megasenaConfig.id).toBe('megasena')
    expect(megasenaConfig.nome).toBe('Mega-Sena')
  })

  it('respeita as regras de dezenas da Mega-Sena (aposta fixa de 6)', () => {
    expect(megasenaConfig.dezenasMin).toBe(6)
    expect(megasenaConfig.dezenasMax).toBe(6)
    expect(megasenaConfig.dezenasMin).toBeLessThanOrEqual(megasenaConfig.dezenasMax)
  })

  it('define a faixa numérica de 1 a 60', () => {
    expect(megasenaConfig.faixaMin).toBe(1)
    expect(megasenaConfig.faixaMax).toBe(60)
    expect(megasenaConfig.faixaMax).toBeGreaterThan(megasenaConfig.faixaMin)
  })

  it('define a grade de 10 colunas × 6 linhas', () => {
    expect(megasenaConfig.colunas).toBe(10)
    expect(megasenaConfig.linhas).toBe(6)
    expect(megasenaConfig.colunas * megasenaConfig.linhas).toBe(megasenaConfig.faixaMax)
  })

  it('filtros possuem valores razoáveis para a Mega-Sena', () => {
    expect(megasenaConfig.filtros.parImpar.min).toBe(2)
    expect(megasenaConfig.filtros.parImpar.max).toBe(4)
    expect(megasenaConfig.filtros.parImpar.min).toBeLessThanOrEqual(megasenaConfig.filtros.parImpar.max)
    expect(megasenaConfig.filtros.sequenciais.maxConsecutivos).toBe(3)
    expect(megasenaConfig.filtros.espalhamento.minLinhas).toBe(3)
    expect(megasenaConfig.filtros.espalhamento.minLinhas).toBeLessThanOrEqual(megasenaConfig.linhas)
    expect(megasenaConfig.filtros.soma.tipo).toBe('percentil')
  })
})

describe('configuração da Lotofácil', () => {
  it('exporta o objeto de configuração', () => {
    expect(lotofacilConfig).toBeDefined()
  })

  it('possui todos os campos obrigatórios da interface LoteriaConfig', () => {
    expect(validarLoteriaConfig(lotofacilConfig)).toBe(true)
  })

  it('identifica corretamente a loteria pelo id e nome', () => {
    expect(lotofacilConfig.id).toBe('lotofacil')
    expect(lotofacilConfig.nome).toBe('Lotofácil')
  })

  it('respeita as regras de dezenas da Lotofácil (15 a 20)', () => {
    expect(lotofacilConfig.dezenasMin).toBe(15)
    expect(lotofacilConfig.dezenasMax).toBe(20)
    expect(lotofacilConfig.dezenasMin).toBeLessThan(lotofacilConfig.dezenasMax)
  })

  it('define a faixa numérica de 1 a 25', () => {
    expect(lotofacilConfig.faixaMin).toBe(1)
    expect(lotofacilConfig.faixaMax).toBe(25)
    expect(lotofacilConfig.faixaMax).toBeGreaterThan(lotofacilConfig.faixaMin)
  })

  it('define a grade de 5 colunas × 5 linhas', () => {
    expect(lotofacilConfig.colunas).toBe(5)
    expect(lotofacilConfig.linhas).toBe(5)
    expect(lotofacilConfig.colunas * lotofacilConfig.linhas).toBe(lotofacilConfig.faixaMax)
  })

  it('filtros possuem valores apropriados para a Lotofácil', () => {
    expect(lotofacilConfig.filtros.parImpar.min).toBe(6)
    expect(lotofacilConfig.filtros.parImpar.max).toBe(10)
    expect(lotofacilConfig.filtros.parImpar.min).toBeLessThanOrEqual(lotofacilConfig.filtros.parImpar.max)
    expect(lotofacilConfig.filtros.parImpar.max).toBeLessThanOrEqual(lotofacilConfig.dezenasMax)
    expect(lotofacilConfig.filtros.sequenciais.maxConsecutivos).toBe(4)
    expect(lotofacilConfig.filtros.espalhamento.minLinhas).toBe(4)
    expect(lotofacilConfig.filtros.espalhamento.minLinhas).toBeLessThanOrEqual(lotofacilConfig.linhas)
    expect(lotofacilConfig.filtros.soma.tipo).toBe('absoluto')
  })
})

describe('validação de tipos', () => {
  it('Mega-Sena satisfaz a interface LoteriaConfig', () => {
    const cfg: LoteriaConfig = megasenaConfig
    expect(cfg.id).toBe('megasena')
    expect(cfg.filtros).toBeDefined()
  })

  it('Lotofácil satisfaz a interface LoteriaConfig', () => {
    const cfg: LoteriaConfig = lotofacilConfig
    expect(cfg.id).toBe('lotofacil')
    expect(cfg.filtros).toBeDefined()
  })

  it('validador rejeita objetos que não são configurações válidas', () => {
    expect(validarLoteriaConfig(null)).toBe(false)
    expect(validarLoteriaConfig({})).toBe(false)
    expect(validarLoteriaConfig({ id: 'megasena' })).toBe(false)
    expect(
      validarLoteriaConfig({
        id: 'x',
        nome: 'X',
        dezenasMin: 6,
        dezenasMax: 6,
        faixaMin: 1,
        faixaMax: 60,
        colunas: 10,
        linhas: 6,
      })
    ).toBe(false)
  })

  it('validador rejeita configurações com limites inconsistentes', () => {
    const configComDezenasInvertidas = {
      id: 'teste',
      nome: 'Teste',
      dezenasMin: 10,
      dezenasMax: 6,
      faixaMin: 1,
      faixaMax: 60,
      colunas: 10,
      linhas: 6,
      filtros: megasenaConfig.filtros,
    }
    expect(validarLoteriaConfig(configComDezenasInvertidas)).toBe(false)
  })

  it('validador rejeita faixa numérica invertida', () => {
    const configComFaixaInvertida = {
      id: 'teste',
      nome: 'Teste',
      dezenasMin: 6,
      dezenasMax: 6,
      faixaMin: 60,
      faixaMax: 1,
      colunas: 10,
      linhas: 6,
      filtros: megasenaConfig.filtros,
    }
    expect(validarLoteriaConfig(configComFaixaInvertida)).toBe(false)
  })
})

describe('estrutura de filtros', () => {
  it('FiltrosConfig contém todos os campos obrigatórios', () => {
    expect(validarFiltrosConfig(megasenaConfig.filtros)).toBe(true)
    expect(validarFiltrosConfig(lotofacilConfig.filtros)).toBe(true)
  })

  it('soma aceita a variante absoluto', () => {
    const absoluto: FiltrosConfig = {
      parImpar: { min: 2, max: 4 },
      sequenciais: { maxConsecutivos: 3 },
      soma: { tipo: 'absoluto', min: 100, max: 200 },
      espalhamento: { minLinhas: 3 },
    }

    expect(validarFiltrosConfig(absoluto)).toBe(true)
    expect(absoluto.soma.tipo).toBe('absoluto')

    if (absoluto.soma.tipo === 'absoluto') {
      expect(absoluto.soma.min).toBe(100)
      expect(absoluto.soma.max).toBe(200)
      expect(absoluto.soma.min).toBeLessThanOrEqual(absoluto.soma.max)
    }
  })

  it('soma aceita a variante percentil', () => {
    const percentil: FiltrosConfig = {
      parImpar: { min: 2, max: 4 },
      sequenciais: { maxConsecutivos: 3 },
      soma: { tipo: 'percentil', minPercentil: 0.1, maxPercentil: 0.9 },
      espalhamento: { minLinhas: 3 },
    }

    expect(validarFiltrosConfig(percentil)).toBe(true)
    expect(percentil.soma.tipo).toBe('percentil')

    if (percentil.soma.tipo === 'percentil') {
      expect(percentil.soma.minPercentil).toBe(0.1)
      expect(percentil.soma.maxPercentil).toBe(0.9)
      expect(percentil.soma.minPercentil).toBeLessThan(percentil.soma.maxPercentil)
    }
  })

  it('validador rejeita soma com união discriminada inválida', () => {
    const semTipo = {
      parImpar: { min: 2, max: 4 },
      sequenciais: { maxConsecutivos: 3 },
      soma: { min: 100, max: 200 },
      espalhamento: { minLinhas: 3 },
    }
    expect(validarFiltrosConfig(semTipo)).toBe(false)

    const tipoDesconhecido = {
      parImpar: { min: 2, max: 4 },
      sequenciais: { maxConsecutivos: 3 },
      soma: { tipo: 'relativo', min: 100, max: 200 },
      espalhamento: { minLinhas: 3 },
    }
    expect(validarFiltrosConfig(tipoDesconhecido)).toBe(false)

    const percentilInvertido = {
      parImpar: { min: 2, max: 4 },
      sequenciais: { maxConsecutivos: 3 },
      soma: { tipo: 'percentil', minPercentil: 0.9, maxPercentil: 0.1 },
      espalhamento: { minLinhas: 3 },
    }
    expect(validarFiltrosConfig(percentilInvertido)).toBe(false)
  })

  it('validador rejeita filtros com parImpar invertido', () => {
    const filtrosInvalidos = {
      parImpar: { min: 4, max: 2 },
      sequenciais: { maxConsecutivos: 3 },
      soma: { tipo: 'absoluto', min: 100, max: 200 },
      espalhamento: { minLinhas: 3 },
    }
    expect(validarFiltrosConfig(filtrosInvalidos)).toBe(false)
  })

  it('validador rejeita filtros sem campo obrigatório', () => {
    const filtrosIncompletos = {
      parImpar: { min: 2, max: 4 },
      sequenciais: { maxConsecutivos: 3 },
      soma: { tipo: 'absoluto', min: 100, max: 200 },
    }
    expect(validarFiltrosConfig(filtrosIncompletos)).toBe(false)
  })
})

describe('validação de consistência da configuração', () => {
  it('aceita a configuração da Mega-Sena', () => {
    expect(() => validarConfigLoteria(megasenaConfig)).not.toThrow()
  })

  it('aceita a configuração da Lotofácil', () => {
    expect(() => validarConfigLoteria(lotofacilConfig)).not.toThrow()
  })

  it('rejeita parImpar.max maior que dezenasMax', () => {
    const configInvalida: LoteriaConfig = {
      ...megasenaConfig,
      filtros: {
        ...megasenaConfig.filtros,
        parImpar: { min: 2, max: 8 },
      },
    }
    expect(() => validarConfigLoteria(configInvalida)).toThrow()
  })

  it('rejeita espalhamento.minLinhas maior que linhas', () => {
    const configInvalida: LoteriaConfig = {
      ...megasenaConfig,
      filtros: {
        ...megasenaConfig.filtros,
        espalhamento: { minLinhas: 10 },
      },
    }
    expect(() => validarConfigLoteria(configInvalida)).toThrow()
  })

  it('rejeita grade menor que a faixa de dezenas', () => {
    const configInvalida: LoteriaConfig = {
      ...megasenaConfig,
      colunas: 5,
      linhas: 5,
    }
    expect(() => validarConfigLoteria(configInvalida)).toThrow()
  })
})
