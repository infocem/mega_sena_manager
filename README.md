# Mega-Sena Manager

Gerenciador de jogos da Mega-Sena (Vite + React + TypeScript). Carrega o histórico
oficial de concursos da Caixa, calcula estatísticas e sugere jogos.

## Stack

- **Vite** + **React 18** + **TypeScript**
- **IndexedDB** (via `idb-keyval`) para cache local dos concursos
- **Recharts** para os gráficos
- **Vitest** + Testing Library para os testes

## Desenvolvimento

```bash
npm install
npm run dev        # sobe o servidor de dev (Vite) com proxy para a API da Caixa
npm run build      # typecheck + build de produção
npm run preview    # serve o build
npm test           # roda a suíte (vitest)
npm run typecheck  # apenas checagem de tipos
```

Em dev, as requisições à API oficial passam pelo proxy do Vite
(`/api/loterias` → `servicebus2.caixa.gov.br/portaldeloterias/api`), o que contorna o CORS.

## Base de concursos: como funciona e como manter atualizada

O app mantém um histórico de concursos da Mega-Sena em duas camadas. Entender a
diferença é o que responde "como capturo os jogos novos".

### 1. Atualização automática (em runtime, no app)

Você **não precisa fazer nada** para o usuário final: a base de cada navegador se
mantém atualizada sozinha a cada carga do app.

Fluxo: `useConcursos` → `carregarConcursos` (`src/data/cache.ts`) → `fetchNovos`
(`src/api/caixa.ts`):

1. Lê a base do **IndexedDB** do navegador (ou popula do arquivo seed na 1ª vez);
2. Descobre o último concurso já cacheado;
3. Busca na API da Caixa **apenas os concursos com número maior** que esse;
4. Mescla e persiste de volta no IndexedDB.

> ⚠️ Isso atualiza **somente o cache local do navegador**, não o arquivo versionado
> no repositório.

### 2. Atualização da base versionada (arquivo seed)

`src/data/megasena-seed.json` é a base "de fábrica" que vai no repositório e popula
o app na primeira carga. Para atualizá-la com os concursos novos, rode o builder —
ele é **resumível**: lê o que já existe, descobre o último concurso e busca **apenas
as lacunas** (`scripts/fetch-seed.mjs`):

```bash
node scripts/fetch-seed.mjs
git add src/data/megasena-seed.json
git commit -m "chore: atualiza seed Mega-Sena até concurso N"
git push
```

Faça isso periodicamente para que novos clones/usuários já comecem com uma base recente.

> ⚠️ **Throttling da API da Caixa:** a API bloqueia o IP (`HTTP 403`) em rajadas de
> requisições. O script já usa concorrência conservadora (6) + backoff exponencial,
> mas se a base estiver muito defasada (muitos concursos faltando) é possível tomar
> um 403 no meio. Isso é esperado pela natureza da API, **não é bug** — basta rodar
> o script novamente mais tarde; ele retoma de onde parou pelo cache do próprio arquivo.

## Estrutura

```
scripts/fetch-seed.mjs     # builder do seed (histórico completo, resumível)
src/api/caixa.ts           # cliente incremental da API da Caixa (fetchNovos)
src/data/cache.ts          # cache em IndexedDB + merge incremental
src/data/seed.ts           # carregamento do seed de arquivo
src/data/megasena-seed.json# base versionada de concursos
src/data/parser.ts         # normalização da resposta crua da Caixa
src/engine/                # geração de jogos (generator) + RNG
src/stats/metrics.ts       # estatísticas dos concursos
src/components/            # UI (Dashboard, Controls, SuggestedGames)
src/hooks/useConcursos.ts  # hook de carregamento da base
```
