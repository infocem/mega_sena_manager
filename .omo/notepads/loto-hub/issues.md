# Issues - LotoHub Plan

## Potential Issues

### API Throttling
- Caixa API returns HTTP 403 on request bursts
- Scripts use concurrency 6 + exponential backoff
- If 403 occurs, re-run script (resumes from cache)

### CORS Limitation
- Vite dev proxy only works in dev mode
- Build/preview have no proxy (known limitation)

### Seed File Size
- `megasena-seed.json` is ~150 kB
- Lotofácil seed will add more

## Gotchas

### File Locations
- Seed files: `src/data/megasena-seed.json`, `src/data/lotofacil-seed.json`
- Config files: `src/config/loterias.ts`, `src/config/megasena.ts`, `src/config/lotofacil.ts`
- Router: `src/router.tsx`
- Tabs: `src/components/layout/lottery-tabs.tsx`
