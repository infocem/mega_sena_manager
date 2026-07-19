# Draft: lotofacil-seed-bundle

## Intent
- **intent**: clear
- **review_required**: true
- **request**: Fix Lotofácil slow loading by bundling a seed file and making API client support both lotteries

## Components
| ID | Component | Outcome | Status | Evidence |
|----|-----------|---------|--------|----------|
| C1 | Create lotofacil-seed.json | Generate bundled seed file with historical Lotofácil data | pending | src/data/ (needs new file) |
| C2 | Update fetch-seed.mjs script | Make script fetch both Mega-Sena and Lotofácil | pending | scripts/fetch-seed.mjs (hardcoded to megasena) |
| C3 | Update API base to be dynamic | Make API_BASE accept loteriaId parameter | pending | src/api/base.ts (hardcoded to megasena) |
| C4 | Update caixa.ts fetch functions | Pass loteriaId to fetchUltimo/fetchNovos | pending | src/api/caixa.ts |
| C5 | Update cache.ts to pass loteriaId | Pass lottery ID when fetching from API | pending | src/data/cache.ts |
| C6 | Update tests | Ensure tests pass with new dynamic API | pending | src/**/*.test.ts |

## Decisions
- All decisions made by exploration - no forks remaining

## Approval Gate
- status: awaiting-approval
- pending: write .omo/plans/lotofacil-seed-bundle.md
- approach: Create seed file + make API client multi-lottery
