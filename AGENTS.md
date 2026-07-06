# AGENTS.md

## Commands

```bash
npm run dev        # Vite dev server with CORS proxy to Caixa API
npm run build      # typecheck (tsc --noEmit) + vite build
npm run typecheck  # tsc --noEmit only
npm test           # vitest run (node env, globals enabled)
npm run test:watch # vitest (watch mode)
```

**Run order for verification**: `npm run typecheck && npm test && npm run build`

**Single test**: `npx vitest run src/path/to/file.test.ts`

**Seed update** (resumable, fetches full history from Caixa API):
```bash
node scripts/fetch-seed.mjs
# Then: git add src/data/megasena-seed.json && git commit
```

**Browser verification** (requires dev server running on :5173):
```bash
node scripts/verify-browser.mjs
```

## Architecture

**Data flow**: `useConcursos` hook → `carregarConcursos` (cache.ts) → IndexedDB cache (via `idb-keyval`) → falls back to versioned seed JSON (`src/data/megasena-seed.json`) → fetches only new contests from Caixa API (`fetchNovos`).

**Two-layer data strategy**:
1. **Runtime cache** (IndexedDB): auto-updates per browser on each load
2. **Versioned seed** (`src/data/megasena-seed.json`): factory base for first load, updated manually via `scripts/fetch-seed.mjs`

**CORS bypass**: Vite dev proxy rewrites `/api/loterias/*` → `servicebus2.caixa.gov.br/portaldeloterias/api/*`. **Only works in dev** — build/preview have no proxy (known limitation).

**API throttling**: Caixa API returns HTTP 403 on request bursts. Scripts use concurrency 6 + exponential backoff. If 403 occurs, re-run later — script resumes from cache.

**Game generation** (`src/engine/`): Deterministic PRNG (mulberry32) with injected seed for reproducibility. Pipeline: weighted sampling (hot/delayed/random) → 6-dezena candidate → structural filters (pairs, sum range, sequential limit, spread) → relax filters progressively if max attempts exceeded.

## Testing

- **Environment**: `node` (not jsdom) — components use jsdom via setup file
- **Globals enabled**: `describe`, `it`, `expect`, `vi` available without imports
- **Setup file** (`src/test/setup.ts`): mocks `ResizeObserver` for recharts
- **DI pattern**: Functions accept injectable deps (e.g., `CacheDeps`, `FetchOpts.fetchImpl`) for testing without real IndexedDB/network
- **Deterministic tests**: Generator tests use fixed seed (`mulberry32(42)`) for reproducibility
- **Component tests**: Use `@testing-library/react` + `user-event`

## Code conventions

- **Language**: Portuguese (Brazilian) — UI text, comments, type names, variable names
- **Strict TypeScript**: `noUnusedLocals`, `noUnusedParameters`, `strict` mode
- **Module system**: ESM (`"type": "module"`)
- **File colocation**: Tests next to source (`file.test.ts` alongside `file.ts`)
- **Type domain**: `src/types.ts` has all domain types (`Concurso`, `Metricas`, `Jogo`, etc.)
- **Pure functions**: Parser/validator functions are pure (no I/O) — easy to test
- **No `as any` / `@ts-ignore`**: Strict type safety enforced

## Build quirks

- **Recharts chunk**: Manually separated into its own chunk (`manualChunks: { recharts: ['recharts'] }`) for better caching. `chunkSizeWarningLimit` raised to 600 kB to suppress warning for this vendor chunk.
- **Seed JSON import**: `src/data/seed.ts` imports `megasena-seed.json` directly (Vite handles JSON imports via `resolveJsonModule`).

## Key gotchas

- **Don't call Caixa API directly from browser** — CORS blocked. Always use `/api/loterias` proxy path in dev.
- **Seed file is versioned** — don't regenerate in CI or tests. It's ~150 kB of historical data.
- **IndexedDB is browser-only** — tests mock it via DI deps, not real IndexedDB.
- **Generator honesty**: All UI text and generator output must include disclaimer that statistical analysis does NOT increase winning chances (ethical constraint).
- **`fetchNovos` concurrency**: Default 4 parallel requests. Increase cautiously — API throttles aggressively.
