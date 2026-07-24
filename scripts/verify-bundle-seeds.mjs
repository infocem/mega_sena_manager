// Guardião de bundle: garante que cada seed versionado (src/data/*-seed.json)
// foi realmente embutido no build de produção (dist/assets/*.js).
//
// Motivo: `src/data/seed-manager.ts` já usou `import()` com caminho computado
// (`./${id}-seed.json`), que o Vite/Rollup não analisa estaticamente — o seed
// da Lotofácil sumia do bundle e o app Android tentava baixar o histórico
// inteiro da API no 1º uso. Este script é o teste de regressão desse bug.
//
// Uso:  npm run build && node scripts/verify-bundle-seeds.mjs
//   ou: npm run verify:bundle   (build + verificação)
//
// Exit 0 = todos os seeds presentes; exit 1 = algum seed ausente do bundle.

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = fileURLToPath(new URL('..', import.meta.url))
const DIST_ASSETS = join(RAIZ, 'dist', 'assets')

// Loterias que precisam ter seed embutido no bundle.
const LOTERIAS = [
  { id: 'megasena', arquivo: 'megasena-seed.json' },
  { id: 'lotofacil', arquivo: 'lotofacil-seed.json' },
]

// Marcadores distintivos extraídos do próprio seed (sem hardcode de dados):
// datas do 1º e do último concurso + sequência de dezenas do 1º concurso.
function marcadores(seed) {
  const primeiro = seed.concursos[0]
  const ultimo = seed.concursos[seed.concursos.length - 1]
  return [
    primeiro.d, // ex.: "29/09/2003"
    ultimo.d,
    primeiro.z.join(','), // ex.: "2,3,5,9,13,17,..."
  ]
}

let chunks
try {
  chunks = readdirSync(DIST_ASSETS).filter((f) => f.endsWith('.js'))
} catch {
  console.error('ERRO: dist/assets não encontrado. Rode `npm run build` antes.')
  process.exit(2)
}

if (chunks.length === 0) {
  console.error('ERRO: nenhum chunk .js em dist/assets. Rode `npm run build` antes.')
  process.exit(2)
}

const bundle = chunks
  .map((f) => readFileSync(join(DIST_ASSETS, f), 'utf8'))
  .join('\n')

let falhou = false
for (const { id, arquivo } of LOTERIAS) {
  const seed = JSON.parse(
    readFileSync(join(RAIZ, 'src', 'data', arquivo), 'utf8'),
  )
  const faltando = marcadores(seed).filter((m) => !bundle.includes(m))

  if (faltando.length > 0) {
    falhou = true
    console.error(
      `✗ seed "${id}" AUSENTE do bundle (${arquivo}, ${seed.concursos.length} concursos). ` +
        `Marcadores não encontrados: ${faltando.map((m) => JSON.stringify(m)).join(', ')}`,
    )
  } else {
    console.log(
      `✓ seed "${id}" presente no bundle (${seed.concursos.length} concursos)`,
    )
  }
}

if (falhou) {
  console.error(
    '\nFALHA: seed(s) não embutidos no bundle de produção. ' +
      'Verifique se os imports em src/data/seed-manager.ts usam caminhos literais.',
  )
  process.exit(1)
}

console.log('\nOK: todos os seeds estão embutidos no bundle de produção.')
