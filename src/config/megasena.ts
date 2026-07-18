// Configuração da Mega-Sena.
// Regras: aposta com 6 dezenas, sorteio de 6 dezenas entre 1 e 60.
import { validarLoteriaConfig, type LoteriaConfig } from './loterias'

export const megasenaConfig: LoteriaConfig = {
  id: 'megasena',
  nome: 'Mega-Sena',
  dezenasMin: 6,
  dezenasMax: 6,
  faixaMin: 1,
  faixaMax: 60,
  colunas: 10,
  linhas: 6,
  filtros: {
    parImpar: { min: 2, max: 4 },
    sequenciais: { maxConsecutivos: 3 },
    soma: { tipo: 'percentil', minPercentil: 0.1, maxPercentil: 0.9 },
    espalhamento: { minLinhas: 3 },
  },
}

validarLoteriaConfig(megasenaConfig)
