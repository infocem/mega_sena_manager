import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('getApiBase', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns absolute URL for megasena on native platform', async () => {
    vi.doMock('@capacitor/core', () => ({
      Capacitor: {
        isNativePlatform: () => true,
      },
    }))

    const { getApiBase } = await import('./base')
    expect(getApiBase('megasena')).toBe('https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena')
  })

  it('returns relative path for megasena on web', async () => {
    vi.doMock('@capacitor/core', () => ({
      Capacitor: {
        isNativePlatform: () => false,
      },
    }))

    const { getApiBase } = await import('./base')
    expect(getApiBase('megasena')).toBe('/api/loterias/megasena')
  })

  it('returns absolute URL for lotofacil on native platform', async () => {
    vi.doMock('@capacitor/core', () => ({
      Capacitor: {
        isNativePlatform: () => true,
      },
    }))

    const { getApiBase } = await import('./base')
    expect(getApiBase('lotofacil')).toBe('https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil')
  })

  it('returns relative path for lotofacil on web', async () => {
    vi.doMock('@capacitor/core', () => ({
      Capacitor: {
        isNativePlatform: () => false,
      },
    }))

    const { getApiBase } = await import('./base')
    expect(getApiBase('lotofacil')).toBe('/api/loterias/lotofacil')
  })

  it('throws error for unsupported lottery', async () => {
    vi.doMock('@capacitor/core', () => ({
      Capacitor: {
        isNativePlatform: () => false,
      },
    }))

    const { getApiBase } = await import('./base')
    expect(() => getApiBase('loteca')).toThrow('Loteria não suportada')
  })

  it('API_BASE still works for backward compatibility', async () => {
    vi.doMock('@capacitor/core', () => ({
      Capacitor: {
        isNativePlatform: () => false,
      },
    }))

    const { API_BASE } = await import('./base')
    expect(API_BASE).toBe('/api/loterias/megasena')
  })
})
