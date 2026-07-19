# lotofacil-seed-bundle - Work Plan

## TL;DR (For humans)

**Problem:** Lotofácil loads slowly on Android because it has no bundled seed file, forcing it to fetch all historical data from the API on first load.

**Solution:** 
1. Create `lotofacil-seed.json` with historical data
2. Update `fetch-seed.mjs` to fetch both lotteries
3. Make API client dynamic to support both Mega-Sena and Lotofácil

**What this will NOT do:**
- Change the UI or user experience
- Modify existing lottery logic
- Affect the existing Mega-Sena functionality

**Effort:** Medium (1-2 hours)
**Risk:** Low (isolated changes, backward compatible)
**Decisions:** All made by exploration - no forks remaining

## Scope

### In Scope
- Create bundled seed file for Lotofácil
- Update seed builder script to support both lotteries
- Make API client accept lottery ID parameter
- Update all callers to pass lottery ID
- Ensure all tests pass

### Out of Scope
- UI changes
- New lottery types
- Performance optimization beyond seed bundling
- API rate limit changes

## Verification strategy

### Test Strategy
- **TDD**: No - this is infrastructure work
- **Tests-after**: Add/update tests after implementation
- **Agent-executed QA**: Verify all tests pass, manual verification of data flow

### QA Scenarios
1. **Happy path**: App loads Lotofácil tab with bundled seed data (no API calls)
2. **Fallback**: If seed file missing, app still works (graceful degradation)
3. **Incremental update**: New concursos fetched from API after seed load
4. **Backward compatibility**: Mega-Sena still works exactly as before

## Execution strategy

### Wave 1: Foundation (No dependencies)
1. Create `lotofacil-seed.json` (C1)
2. Update `scripts/fetch-seed.mjs` (C2)

### Wave 2: API Layer (Depends on Wave 1)
3. Update `src/api/base.ts` (C3)
4. Update `src/api/caixa.ts` (C4)
5. Update `src/data/cache.ts` (C5)

### Wave 3: Verification (Depends on Wave 2)
6. Update and run tests (C6)

## Todos

### Todo 1: Create lotofacil-seed.json
**Component:** C1 - Create bundled seed file
**References:**
- `src/data/megasena-seed.json` (existing seed format)
- `src/data/seed-manager.ts:23-25` (expects `./loteriaId-seed.json`)
- `src/data/parser.ts` (parseSeedEntries function)

**Acceptance Criteria:**
- [ ] File exists at `src/data/lotofacil-seed.json`
- [ ] Same format as `megasena-seed.json` (fonte, ultimo, concursos array)
- [ ] Contains historical Lotofácil data (first ~1000 concursos for initial load)
- [ ] Each entry has: n (number), d (date), z (15-20 dezenas sorted)
- [ ] File is valid JSON

**QA Scenarios:**
- Happy: `carregarSeedPorLoteria('lotofacil')` returns array of Concurso objects
- Failure: File missing → returns empty array (existing behavior)

**Commit:** `feat(data): add lotofacil-seed.json with historical data`

---

### Todo 2: Update fetch-seed.mjs to support both lotteries
**Component:** C2 - Update seed builder script
**References:**
- `scripts/fetch-seed.mjs` (current implementation, hardcoded to megasena)
- `src/api/caixa.ts` (API patterns)

**Acceptance Criteria:**
- [ ] Script accepts `--loteria` argument (default: both)
- [ ] Can fetch Mega-Sena history (existing behavior)
- [ ] Can fetch Lotofácil history
- [ ] Outputs to correct file: `src/data/{loteriaId}-seed.json`
- [ ] Maintains resume support (checkpoint every 100 concursos)
- [ ] Uses same concurrency/backoff settings

**QA Scenarios:**
- Happy: `node scripts/fetch-seed.mjs --loteria lotofacil` creates `lotofacil-seed.json`
- Happy: `node scripts/fetch-seed.mjs` fetches both lotteries
- Failure: API error → graceful retry, resumes from checkpoint

**Commit:** `feat(scripts): update fetch-seed.mjs to support multiple lotteries`

---

### Todo 3: Update API base to be dynamic
**Component:** C3 - Make API_BASE accept loteriaId
**References:**
- `src/api/base.ts` (current: hardcoded to megasena)
- `src/api/base.test.ts` (existing tests)

**Acceptance Criteria:**
- [ ] Export function `getApiBase(loteriaId: string): string`
- [ ] Returns correct URL for 'megasena' and 'lotofacil'
- [ ] Works in both Capacitor (native) and web environments
- [ ] Backward compatible (existing code still works)

**QA Scenarios:**
- Happy: `getApiBase('megasena')` returns megasena URL
- Happy: `getApiBase('lotofacil')` returns lotofacil URL
- Failure: Unknown loteriaId → throws descriptive error

**Commit:** `refactor(api): make API_BASE dynamic by lottery ID`

---

### Todo 4: Update caixa.ts fetch functions
**Component:** C4 - Pass loteriaId to fetch functions
**References:**
- `src/api/caixa.ts` (current: uses hardcoded BASE)
- `src/api/base.ts` (getApiBase function)

**Acceptance Criteria:**
- [ ] `fetchUltimo(loteriaId, opts?)` accepts loteriaId
- [ ] `fetchConcurso(loteriaId, numero, opts?)` accepts loteriaId
- [ ] `fetchNovos(loteriaId, ultimoCacheado, opts?)` accepts loteriaId
- [ ] Internal calls use `getApiBase(loteriaId)`
- [ ] Backward compatible (loteriaId optional, defaults to 'megasena')

**QA Scenarios:**
- Happy: `fetchUltimo('lotofacil')` fetches from Lotofácil API
- Happy: `fetchNovos('megasena', 100)` fetches only new Mega-Sena
- Failure: API returns 403 → retry with backoff

**Commit:** `refactor(api): add loteriaId parameter to fetch functions`

---

### Todo 5: Update cache.ts to pass loteriaId
**Component:** C5 - Pass lottery ID when fetching from API
**References:**
- `src/data/cache.ts` (current: calls fetchNovos without loteriaId)
- `src/api/caixa.ts` (fetchNovos signature)

**Acceptance Criteria:**
- [ ] `carregarConcursos` passes `opts.loteriaId` to `buscarNovos`
- [ ] Correct seed loaded per lottery (existing behavior)
- [ ] Cache key includes loteriaId (existing behavior)
- [ ] Incremental updates work for both lotteries

**QA Scenarios:**
- Happy: `carregarConcursos({ loteriaId: 'lotofacil' })` uses lotofacil API
- Happy: `carregarConcursos({ loteriaId: 'megasena' })` uses megasena API
- Failure: API unavailable → uses seed/cache only

**Commit:** `fix(data): pass loteriaId to API fetch calls`

---

### Todo 6: Update and run tests
**Component:** C6 - Ensure tests pass
**References:**
- `src/api/base.test.ts`
- `src/api/caixa.test.ts` (if exists)
- `src/data/cache.test.ts`
- `src/data/data-layer.test.ts`

**Acceptance Criteria:**
- [ ] All existing tests pass
- [ ] New tests for `getApiBase` function
- [ ] New tests for `fetchUltimo` with loteriaId
- [ ] Tests verify correct API URLs are used
- [ ] No regressions in existing functionality

**QA Scenarios:**
- Happy: `npm test` passes all tests
- Happy: `npm run typecheck` passes
- Failure: Test fails → fix before proceeding

**Commit:** `test: add tests for multi-lottery API support`

---

## Final verification wave

After all todos complete, run in parallel:

1. **F1 - Plan compliance audit**: Verify all acceptance criteria met
2. **F2 - Code quality review**: Check for edge cases, error handling
3. **F3 - Manual QA**: Test both lotteries in app
4. **F4 - Scope fidelity**: Confirm no unintended changes

## Commit strategy

- Each todo has its own commit for atomic changes
- Use conventional commits: `feat`, `refactor`, `fix`, `test`
- Squash before merge if needed

## Success criteria

- [ ] Lotofácil loads instantly with bundled seed data
- [ ] Mega-Sena still works exactly as before
- [ ] Both lotteries support incremental API updates
- [ ] All tests pass
- [ ] No regressions in existing functionality
