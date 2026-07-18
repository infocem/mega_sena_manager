// One-shot seed builder: fetches the full Lotofácil history from the official
// Caixa API and writes a versioned compact JSON file to src/data/lotofacil-seed.json.
// Run once (offline-friendly afterwards): `node scripts/fetch-seed-lotofacil.mjs`.
// Conservative concurrency + retry/backoff to avoid IP bans.
import { writeFile, mkdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const BASE = 'https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil'
const OUT = new URL('../src/data/lotofacil-seed.json', import.meta.url)
const HEADERS = { 'User-Agent': 'Mozilla/5.0 (loto-hub seed builder)', Accept: 'application/json' }
const CONCURRENCY = 6
const MIN_DEZENAS = 15
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchJson(url, attempt = 0) {
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 15000)
    const res = await fetch(url, { headers: HEADERS, signal: ctrl.signal })
    clearTimeout(t)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    if (attempt >= 5) throw err
    const backoff = Math.min(8000, 400 * 2 ** attempt)
    await sleep(backoff)
    return fetchJson(url, attempt + 1)
  }
}

function toEntry(raw) {
  const dezenas = (raw.listaDezenas ?? []).map(Number).sort((a, b) => a - b)
  return { n: Number(raw.numero), d: raw.dataApuracao, z: dezenas }
}

async function main() {
  const ultimo = await fetchJson(BASE)
  const total = Number(ultimo.numero)
  console.log(`Último concurso Lotofácil: ${total}`)

  // resume support
  const cache = new Map()
  if (existsSync(OUT)) {
    try {
      const prev = JSON.parse(await readFile(OUT, 'utf8'))
      for (const e of prev.concursos ?? []) cache.set(e.n, e)
      console.log(`Resumindo: ${cache.size} já em cache`)
    } catch {}
  }
  cache.set(total, toEntry(ultimo))

  const pending = []
  for (let n = 1; n <= total; n++) if (!cache.has(n)) pending.push(n)
  console.log(`Faltam ${pending.length} concursos`)

  let done = 0
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (pending.length) {
      const n = pending.shift()
      try {
        const raw = await fetchJson(`${BASE}/${n}`)
        const entry = toEntry(raw)
        // Lotofácil requires at least 15 dezenas (15-20 range)
        if (Number.isFinite(entry.n) && entry.z.length >= MIN_DEZENAS) cache.set(n, entry)
      } catch (err) {
        console.warn(`falha concurso ${n}: ${err.message}`)
      }
      if (++done % 100 === 0) {
        console.log(`progresso: ${done}/${pending.length + done}`)
        await checkpoint(cache, total)
      }
    }
  })
  await Promise.all(workers)
  await checkpoint(cache, total)
  console.log(`Concluído: ${cache.size} concursos gravados`)
}

async function checkpoint(cache, total) {
  const concursos = [...cache.values()].sort((a, b) => a.n - b.n)
  await mkdir(new URL('../src/data/', import.meta.url), { recursive: true })
  await writeFile(
    OUT,
    JSON.stringify({ fonte: 'Caixa Econômica Federal — API oficial', ultimo: total, concursos }),
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
