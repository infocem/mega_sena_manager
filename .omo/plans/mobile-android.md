# mobile-android - Work Plan

## TL;DR (For humans)

**What you'll get**: An installable Android APK of the existing Mega-Sena Manager web app, built with Capacitor 8.x. The same codebase serves both web (via `npm run dev` with Vite proxy) and Android (via Capacitor WebView + native HTTP).

**Why this approach**: Capacitor wraps the existing Vite+React app in a native Android WebView with zero UI rewrites. The CORS problem (Caixa API blocks browser requests) is solved by `CapacitorHttp`, which patches `fetch()` to use Android's native HTTP stack — no proxy needed in the APK. The entire logic layer (engine, stats, parser) is already pure TypeScript and works unchanged.

**What it will NOT do**:
- Not rewrite the UI in React Native (unnecessary — the web UI works fine in WebView)
- Not add native features (push notifications, biometrics, etc.) — out of scope
- Not publish to Google Play Store (just generates a local APK)
- Not change the web app behavior (web continues using Vite proxy as before)

**Effort**: ~2-3 hours of implementation + testing. Small scope: 1 new file (`base.ts`), 1 config file (`capacitor.config.ts`), npm install, Android scaffold, 4 npm scripts.

**Risk**: Low. The changes are additive (new files, new scripts). The only modification to existing code is importing `API_BASE` from `base.ts` instead of hardcoding the path in `caixa.ts`. TDD ensures the conditional logic is correct before integration.

**Decisions made**:
- App ID: `com.infocem.megasena`
- Capacitor 8.x (latest stable, minSdk 23 / Android 6.0+)
- `CapacitorHttp.enabled: true` (bypass CORS via native HTTP)
- `androidScheme: 'https'` (modern default, avoids v5→v6 data loss issue)
- TDD for new code (`base.ts` conditional logic)
- Dual distribution: web + Android from same codebase

## Scope

**IN**:
- Install Capacitor packages (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`)
- Create `capacitor.config.ts` with app metadata, HTTP plugin, webDir
- Create `src/api/base.ts` with `Capacitor.isNativePlatform()` conditional (absolute URL in native, relative path in web)
- Update `src/api/caixa.ts` to import `API_BASE` from `base.ts`
- Add npm scripts: `cap:sync`, `cap:build:debug`, `cap:open`, `cap:build:release`
- Scaffold Android project (`npx cap add android`)
- TDD: write tests for `base.ts` conditional logic before implementation
- (Optional) Add `navigator.storage.persist()` call in `useConcursos` hook for storage persistence on Android

**OUT**:
- UI redesign for mobile (the existing responsive CSS works in WebView)
- Native features (push notifications, biometrics, camera, etc.)
- Google Play Store publishing
- iOS support (out of scope for this plan; can be added later with `npx cap add ios`)
- Changes to web app behavior (web continues using Vite proxy)

## Verification strategy

**TDD for new code**: Write tests for `src/api/base.ts` before implementation. Mock `Capacitor.isNativePlatform()` to verify both branches (native → absolute URL, web → relative path).

**Integration verification**:
1. `npm run typecheck && npm test && npm run build` — existing suite passes (no regressions)
2. `npm run cap:sync` — builds web app and syncs to Android project
3. `npm run cap:build:debug` — generates APK at `android/app/build/outputs/apk/debug/app-debug.apk`
4. Install APK on Android device/emulator → verify:
   - App loads without CORS errors
   - Caixa API fetch works (native HTTP bypass)
   - IndexedDB cache works (seed loads, new contests fetch)
   - UI renders correctly (Recharts graphs, controls, suggested games)
   - "Regenerar" button works (generator pipeline)

**Manual QA**: Use `scripts/verify-browser.mjs` as reference — adapt for Android WebView if needed (or just manual inspection on device).

## Execution strategy

**Wave 1: Foundation (TDD)**
- Write tests for `src/api/base.ts` (mock `Capacitor.isNativePlatform()`)
- Implement `src/api/base.ts` with conditional logic
- Update `src/api/caixa.ts` to import `API_BASE`
- Verify: `npm test` passes (new tests + existing suite)

**Wave 2: Capacitor setup**
- Install Capacitor packages
- Create `capacitor.config.ts`
- Add npm scripts to `package.json`
- Verify: `npm run typecheck` passes, `npx cap --version` works

**Wave 3: Android scaffold**
- Run `npx cap add android` (creates `android/` directory)
- Run `npm run cap:sync` (copies `dist/` into Android assets)
- Verify: `android/app/src/main/assets/public/index.html` exists

**Wave 4: Build APK**
- Run `npm run cap:build:debug` (generates APK)
- Verify: APK exists at `android/app/build/outputs/apk/debug/app-debug.apk`
- (Optional) Install on device/emulator and manual QA

**Wave 5: Hardening (optional)**
- Add `navigator.storage.persist()` call in `useConcursos` hook
- Verify: no console errors on Android, IndexedDB persists across app restarts

## Todos

### Wave 1: Foundation (TDD)

#### Todo 1.1: Write tests for `src/api/base.ts` ✅
**References**:
- `src/api/caixa.ts:8` — current hardcoded `BASE = '/api/loterias/megasena'`
- `src/types.ts` — domain types (no changes needed)
- Capacitor docs: `Capacitor.isNativePlatform()` returns `true` on native (Android/iOS), `false` on web

**Acceptance criteria**:
- Test file `src/api/base.test.ts` exists
- Tests mock `Capacitor.isNativePlatform()` to return `true` → verify `API_BASE` is absolute URL (`https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena`)
- Tests mock `Capacitor.isNativePlatform()` to return `false` → verify `API_BASE` is relative path (`/api/loterias/megasena`)
- `npm test` passes (new tests + existing suite)

**QA scenarios**:
- Happy: `Capacitor.isNativePlatform()` returns `true` → `API_BASE === 'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena'`
- Happy: `Capacitor.isNativePlatform()` returns `false` → `API_BASE === '/api/loterias/megasena'`
- Failure: test fails if `API_BASE` is hardcoded (no conditional logic)

**Commit**: `test: add TDD tests for API base URL conditional`

---

#### Todo 1.2: Implement `src/api/base.ts` with conditional logic ✅
**References**:
- `src/api/base.test.ts` — tests from Todo 1.1
- `@capacitor/core` — `Capacitor.isNativePlatform()` API
- `src/api/caixa.ts:8` — current `BASE` constant to replace

**Acceptance criteria**:
- `src/api/base.ts` exists and exports `API_BASE: string`
- Imports `Capacitor` from `@capacitor/core`
- Uses `Capacitor.isNativePlatform()` to return absolute URL (native) or relative path (web)
- `npm test` passes (tests from Todo 1.1 now pass)

**QA scenarios**:
- Happy: import `API_BASE` in test, mock native → verify absolute URL
- Happy: import `API_BASE` in test, mock web → verify relative path
- Failure: `API_BASE` is wrong value → tests fail

**Commit**: `feat: add API base URL conditional for web vs native`

---

#### Todo 1.3: Update `src/api/caixa.ts` to use `API_BASE` ✅
**References**:
- `src/api/caixa.ts:8` — current `const BASE = '/api/loterias/megasena'`
- `src/api/base.ts` — new `API_BASE` export

**Acceptance criteria**:
- `src/api/caixa.ts` imports `API_BASE` from `./base`
- `const BASE = API_BASE` (or inline usage)
- `npm run typecheck` passes
- `npm test` passes (existing `caixa.test.ts` still works — it mocks `fetchImpl`, so URL doesn't matter)

**QA scenarios**:
- Happy: `caixa.ts` uses `API_BASE` → no hardcoded path
- Happy: existing tests pass (no regression)
- Failure: `caixa.ts` still has hardcoded path → typecheck or lint fails

**Commit**: `refactor: use API_BASE in caixa.ts instead of hardcoded path`

---

### Wave 2: Capacitor setup

#### Todo 2.1: Install Capacitor packages ✅
**References**:
- `package.json` — current dependencies
- Capacitor docs: `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` (v8.x)

**Acceptance criteria**:
- `package.json` includes `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` (v8.x)
- `npm install` succeeds
- `npx cap --version` outputs version ≥ 8.0.0

**QA scenarios**:
- Happy: `npm install` completes without errors
- Happy: `npx cap --version` works
- Failure: npm install fails → check Node version (≥ 20 required for Capacitor 8.x)

**Commit**: `chore: install Capacitor packages for Android build`

---

#### Todo 2.2: Create `capacitor.config.ts` ✅
**References**:
- `capacitor.config.ts` (new file)
- Capacitor docs: config schema, `CapacitorHttp` plugin, `webDir`, `appId`, `appName`
- User decisions: `com.infocem.megasena`, `Mega-Sena Manager`, `CapacitorHttp.enabled: true`

**Acceptance criteria**:
- `capacitor.config.ts` exists at project root
- Config includes:
  - `appId: 'com.infocem.megasena'`
  - `appName: 'Mega-Sena Manager'`
  - `webDir: 'dist'` (matches Vite build output)
  - `plugins.CapacitorHttp.enabled: true`
  - `server.androidScheme: 'https'`
- `npx cap --version` still works (config is valid)

**QA scenarios**:
- Happy: config is valid JSON/TS, `npx cap` reads it without errors
- Happy: `webDir: 'dist'` matches Vite output
- Failure: config has syntax error → `npx cap` fails

**Commit**: `feat: add Capacitor config for Android build`

---

#### Todo 2.3: Add npm scripts for Capacitor workflow ✅
**References**:
- `package.json` — current scripts
- Capacitor docs: `npx cap sync`, `npx cap open`, `npx cap add android`
- Build pipeline: `npm run build` → `npx cap sync android` → APK

**Acceptance criteria**:
- `package.json` includes:
  - `cap:sync`: `npm run build && npx cap sync android`
  - `cap:open`: `npm run cap:sync && npx cap open android`
  - `cap:build:debug`: `npm run cap:sync && cd android && ./gradlew assembleDebug`
  - `cap:build:release`: `npm run cap:sync && cd android && ./gradlew assembleRelease`
- `npm run cap:sync --help` works (script is valid)

**QA scenarios**:
- Happy: `npm run cap:sync` builds web app and syncs to Android
- Happy: `npm run cap:build:debug` generates APK
- Failure: script has typo → npm fails

**Commit**: `chore: add npm scripts for Capacitor Android workflow`

---

### Wave 3: Android scaffold

#### Todo 3.1: Scaffold Android project with `npx cap add android` ✅
**References**:
- Capacitor docs: `npx cap add android` creates `android/` directory
- `.gitignore` — should NOT ignore `android/` (commit it for reproducibility)

**Acceptance criteria**:
- `android/` directory exists at project root
- `android/app/src/main/assets/public/` exists (will be populated by `cap sync`)
- `android/app/build.gradle` exists
- `android/` is NOT in `.gitignore` (commit it)

**QA scenarios**:
- Happy: `npx cap add android` completes without errors
- Happy: `android/` directory structure is correct
- Failure: command fails → check Capacitor config is valid

**Commit**: `chore: scaffold Android project with Capacitor`

---

#### Todo 3.2: Sync web build to Android assets ✅
**References**:
- `npm run cap:sync` script from Todo 2.3
- `dist/` — Vite build output
- `android/app/src/main/assets/public/` — Capacitor copies web assets here

**Acceptance criteria**:
- `npm run cap:sync` succeeds
- `android/app/src/main/assets/public/index.html` exists
- `android/app/src/main/assets/public/assets/` exists (JS/CSS bundles)

**QA scenarios**:
- Happy: `npm run cap:sync` copies `dist/` to Android assets
- Happy: `index.html` exists in Android assets
- Failure: sync fails → check `webDir: 'dist'` in config, run `npm run build` first

**Commit**: `chore: sync web build to Android assets`

---

### Wave 4: Build APK

#### Todo 4.1: Generate debug APK ✅
**References**:
- `npm run cap:build:debug` script from Todo 2.3
- Android Gradle: `./gradlew assembleDebug` generates APK
- APK output: `android/app/build/outputs/apk/debug/app-debug.apk`

**Acceptance criteria**:
- `npm run cap:build:debug` succeeds
- APK exists at `android/app/build/outputs/apk/debug/app-debug.apk`
- APK size is reasonable (10-50 MB for a web app in WebView)

**QA scenarios**:
- Happy: APK is generated successfully
- Happy: APK can be installed on Android device/emulator
- Failure: Gradle build fails → check Android SDK is installed, `ANDROID_HOME` is set

**Commit**: `chore: generate debug APK for Android`

---

#### Todo 4.2: (Manual QA) Install APK and verify on device ⏳
**References**:
- `scripts/verify-browser.mjs` — reference for what to check (DOM rendering, API fetch, generator)
- Android device or emulator with USB debugging enabled
- `adb install android/app/build/outputs/apk/debug/app-debug.apk`

**Acceptance criteria**:
- APK installs on Android device/emulator without errors
- App launches and shows loading state
- App loads concursos from seed (or fetches new ones via API)
- Dashboard renders (Recharts graphs visible)
- Suggested games section works (Regenerar button changes games)
- No CORS errors in console (native HTTP bypass works)
- No JavaScript errors in console

**QA scenarios**:
- Happy: app loads, API works, UI renders, generator works
- Happy: no CORS errors (CapacitorHttp bypass works)
- Failure: CORS error → check `CapacitorHttp.enabled: true` in config
- Failure: blank screen → check `dist/` was synced to Android assets

**Commit**: (no commit — manual QA, document results in plan)

---

### Wave 5: Hardening (optional)

#### Todo 5.1: Add `navigator.storage.persist()` for IndexedDB persistence (opcional)
**References**:
- `src/hooks/useConcursos.ts` — hook that loads concursos on mount
- MDN: `navigator.storage.persist()` marks storage as persistent (prevents eviction)
- Capacitor docs: Android WebView supports persisted storage API

**Acceptance criteria**:
- `useConcursos` hook calls `navigator.storage.persist()` once on mount (if available)
- No errors on web (where API may not be available)
- No errors on Android (where API is available)
- `npm test` passes (existing tests still work)

**QA scenarios**:
- Happy: `navigator.storage.persist()` is called on Android
- Happy: no errors on web (API not available, gracefully skipped)
- Failure: error thrown → check `navigator.storage?.persist` existence before calling

**Commit**: `feat: persist IndexedDB storage on Android to prevent eviction`

---

## Final verification wave

After all todos complete, run in parallel:

**F1: Plan compliance audit**
- Verify every todo was completed (check commits, file existence)
- Verify all acceptance criteria met (run tests, check APK exists)
- Verify no scope creep (no out-of-scope changes)

**F2: Code quality review**
- `npm run typecheck` passes
- `npm test` passes (all tests, including new `base.test.ts`)
- `npm run build` succeeds
- No `as any` or `@ts-ignore` in new code
- New code follows existing conventions (Portuguese comments, strict types)

**F3: Real manual QA**
- Install APK on Android device/emulator
- Verify app loads, API works, UI renders, generator works
- Verify no CORS errors, no JS errors
- Verify IndexedDB cache works (close app, reopen → data persists)

**F4: Scope fidelity**
- Verify web app still works (`npm run dev` → browser → no regressions)
- Verify Android APK works (install → app loads → API works)
- Verify no changes to web app behavior (Vite proxy still used in web)

## Commit strategy

Atomic commits per todo (listed above). Each commit:
- Has a clear, descriptive message (conventional commits format)
- Passes `npm run typecheck && npm test`
- Is reversible (no breaking changes)

Final commit sequence:
1. `test: add TDD tests for API base URL conditional`
2. `feat: add API base URL conditional for web vs native`
3. `refactor: use API_BASE in caixa.ts instead of hardcoded path`
4. `chore: install Capacitor packages for Android build`
5. `feat: add Capacitor config for Android build`
6. `chore: add npm scripts for Capacitor Android workflow`
7. `chore: scaffold Android project with Capacitor`
8. `chore: sync web build to Android assets`
9. `chore: generate debug APK for Android`
10. (optional) `feat: persist IndexedDB storage on Android to prevent eviction`

## Success criteria

**Must-have**:
- `npm run typecheck && npm test && npm run build` passes (no regressions)
- `npm run cap:build:debug` generates APK at `android/app/build/outputs/apk/debug/app-debug.apk`
- APK installs on Android device/emulator
- App loads without CORS errors (native HTTP bypass works)
- App fetches concursos from Caixa API (or loads from seed)
- UI renders correctly (dashboard, controls, suggested games)
- Generator works (Regenerar button changes games)

**Nice-to-have**:
- `navigator.storage.persist()` prevents IndexedDB eviction on Android
- Web app continues working without changes (`npm run dev` → browser)

**Must-NOT-have**:
- No changes to web app behavior (Vite proxy still used in web)
- No UI redesign (existing responsive CSS works in WebView)
- No native features (push, biometrics, etc.) — out of scope
- No Google Play Store publishing (just local APK)
