import { describe, expect, it } from 'vitest'
import { escolherPonderado, intAte, mulberry32 } from './rng'

describe('rng', () => {
  it('mulberry32 é determinístico para a mesma seed', () => {
    const a = mulberry32(12345)
    const b = mulberry32(12345)
    const seqA = Array.from({ length: 5 }, () => a())
    const seqB = Array.from({ length: 5 }, () => b())
    expect(seqA).toEqual(seqB)
  })

  it('seeds diferentes produzem sequências diferentes', () => {
    const a = mulberry32(1)
    const b = mulberry32(2)
    expect(a()).not.toEqual(b())
  })

  it('produz valores em [0,1)', () => {
    const r = mulberry32(99)
    for (let i = 0; i < 100; i++) {
      const v = r()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('intAte respeita o limite', () => {
    const r = mulberry32(7)
    for (let i = 0; i < 50; i++) {
      const v = intAte(r, 6)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(6)
    }
  })

  it('escolherPonderado respeita pesos e ignora zeros', () => {
    const r = mulberry32(3)
    const pesos = [0, 0, 5, 0] // só índice 2 tem peso
    for (let i = 0; i < 20; i++) expect(escolherPonderado(r, pesos)).toBe(2)
    expect(escolherPonderado(r, [0, 0, 0])).toBe(-1)
  })
})
