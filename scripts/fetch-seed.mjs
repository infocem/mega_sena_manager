// One-shot seed builder: fetches full lottery history from the official
// Caixa API and writes versioned compact JSON files to src/data/{loteria}-seed.json.
// Run once (offline-friendly afterwards): `node scripts/fetch-seed.mjs [--loteria megasena|lotofacil|all]`.
// Conservative concurrency + retry/backoff to avoid IP bans.
import { writeFile, mkdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { parseArgs } from 'node:util'

const HEADERS = { 'User-Agent': 'Mozilla/5.0 (ms-manager seed builder)', Accept: 'application/json' }
const CONCURRENCY = 6
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Configuração por loteria
const LOTERIAS = {
  megasena: {
    baseUrl: 'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena',
    dezenasEsperadas: 6,
  },
  lotofacil: {
    baseUrl: 'https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil',
    dezenasEsperadas: 15,
  },
}

// Parse command line arguments
const { values } = parseArgs({
  options: {
    loteria: { type: 'string', default: 'all' },
  },
})
const loteriaSelecionada = values.loteria || 'all'

// Validate loteria argument
if (loteriaSelecionada !== 'all' && !LOTERIAS[loteriaSelecionada]) {
  console.error(`Loteria inválida: "${loteriaSelecionada}". Use: megasena, lotofacil, ou all`)
  process.exit(1)
}

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

function toEntry(raw, config) {
  const dezenas = (raw.listaDezenas ?? []).map(Number).sort((a, b) => a - b)
  return { n: Number(raw.numero), d: raw.dataApuracao, z: dezenas }
}

async function fetchLoteria(loteriaId, config) {
  console.log(`\n=== Processando ${loteriaId} ===`)
  
  const baseUrl = config.baseUrl
  const outPath = new URL(`../src/data/${loteriaId}-seed.json`, import.meta.url)
  
  const ultimo = await fetchJson(baseUrl)
  const total = Number(ultimo.numero)
  console.log(`Último concurso: ${total}`)

  // resume support
  const cache = new Map()
  if (existsSync(outPath)) {
    try {
      const prev = JSON.parse(await readFile(outPath, 'utf8'))
      for (const e of prev.concursos ?? []) cache.set(e.n, e)
      console.log(`Resumindo: ${cache.size} já em cache`)
    } catch {}
  }
  cache.set(total, toEntry(ultimo, config))

  const pending = []
  for (let n = 1; n <= total; n++) if (!cache.has(n)) pending.push(n)
  console.log(`Faltam ${pending.length} concursos`)

  let done = 0
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (pending.length) {
      const n = pending.shift()
      try {
        const raw = await fetchJson(`${baseUrl}/${n}`)
        const entry = toEntry(raw, config)
        if (Number.isFinite(entry.n) && entry.z.length === config.dezenasEsperadas) {
          cache.set(n, entry)
        }
      } catch (err) {
        console.warn(`falha concurso ${n}: ${err.message}`)
      }
      if (++done % 100 === 0) {
        console.log(`progresso: ${done}/${pending.length + done}`)
        await checkpoint(cache, total, outPath)
      }
    }
  })
  await Promise.all(workers)
  await checkpoint(cache, total, outPath)
  console.log(`Concluído: ${cache.size} concursos gravados para ${loteriaId}`)
}

async function main() {
  console.log(`Loteria selecionada: ${loteriaSelecionada}`)
  
  if (loteriaSelecionada === 'all') {
    // Processar todas as loterias
    for (const [loteriaId, config] of Object.entries(LOTERIAS)) {
      await fetchLoteria(loteriaId, config)
    }
  } else {
    // Processar apenas a loteria selecionada
    await fetchLoteria(loteriaSelecionada, LOTERIAS[loteriaSelecionada])
  }
}

async function checkpoint(cache, total, outPath) {
  const concursos = [...cache.values()].sort((a, b) => a.n - b.n)
  await mkdir(new URL('../src/data/', import.meta.url), { recursive: true })
  await writeFile(
    outPath,
    JSON.stringify({ fonte: 'Caixa Econômica Federal — API oficial', ultimo: total, concursos }),
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
