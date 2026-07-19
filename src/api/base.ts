import { Capacitor } from '@capacitor/core'

// URLs base da API por loteria
const API_URLS: Record<string, { native: string; web: string }> = {
  megasena: {
    native: 'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena',
    web: '/api/loterias/megasena',
  },
  lotofacil: {
    native: 'https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil',
    web: '/api/loterias/lotofacil',
  },
}

/**
 * Retorna a URL base da API para a loteria informada.
 * @param loteriaId - ID da loteria ('megasena' ou 'lotofacil')
 * @returns URL base da API
 * @throws Erro se a loteria não for suportada
 */
export function getApiBase(loteriaId: string): string {
  const urls = API_URLS[loteriaId]
  if (!urls) {
    throw new Error(`Loteria não suportada: "${loteriaId}". Use 'megasena' ou 'lotofacil'`)
  }
  return Capacitor.isNativePlatform() ? urls.native : urls.web
}

/**
 * @deprecated Use getApiBase(loteriaId) em vez de API_BASE.
 * Mantido para retrocompatibilidade - retorna URL da Mega-Sena.
 */
export const API_BASE = getApiBase('megasena')
