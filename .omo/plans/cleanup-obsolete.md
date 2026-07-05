# cleanup-obsolete - Work Plan

## TL;DR (For humans)

**What you'll get:** A clean project tree with only non-development artifacts removed (SDK tools zip, obsolete planning docs, empty dirs, build artifacts). All Capacitor/Android development artifacts are preserved for future mobile builds.

**Why this approach:** The project has Capacitor/Android setup for future mobile versions. We keep all development artifacts (android/, capacitor.config.ts, scripts, dependencies, API base detection) but remove only what's clearly obsolete or regenerable: the downloaded SDK tools zip, greenfield planning docs, empty directories, and build artifacts.

**What it will NOT do:** Will not remove any Capacitor/Android development artifacts. Will not change any application logic, component behavior, data flow, or API client functionality. Will not add new features.

**Effort:** Quick
**Risk:** Low - all changes are reversible via git history; no behavioral changes to the running app.

**Decisions to sanity-check:**
- Keep all Capacitor/Android artifacts for future mobile development
- Remove only `commandlinetools-linux-*.zip` (can be re-downloaded when needed)
- Remove `docs/` (greenfield planning artifacts, project is fully implemented)
- Remove `prometheus/` (empty directory) and `dist/` (build artifact)

Your next move: approve to proceed, or request changes. Full execution detail follows below.

---

> TL;DR (machine): Quick effort, Low risk. Remove only non-development artifacts; keep all Capacitor/Android dev artifacts.

## Scope
### Must have
- Remove `commandlinetools-linux-11076708_latest.zip` (Android SDK tools, can be re-downloaded)
- Remove `prometheus/` directory (empty)
- Remove `dist/` directory (build artifact)
- Remove `docs/` directory (`megasena-cronograma.md`, `megasena-plano.md` - obsolete planning docs)
- Update `README.md` to remove `docs/` reference
- Update `AGENTS.md` if needed
- Clean `.gitignore` (remove `.omc/`, `progress.txt` references)

### Must NOT have (guardrails, anti-slop, scope boundaries)
- Do NOT remove `android/` directory
- Do NOT remove `capacitor.config.ts`
- Do NOT remove `scripts/mobile-preview.mjs`
- Do NOT remove `cap:*` scripts from `package.json`
- Do NOT remove `@capacitor/*` dependencies
- Do NOT remove `src/api/base.ts` or `src/api/base.test.ts`
- Do NOT modify any component logic (Dashboard, SuggestedGames, Controls, engine, stats, data, hooks)
- Do NOT change the data flow or API client behavior
- Do NOT add new features or dependencies
- Do NOT touch `src/data/`, `src/engine/`, `src/stats/`, `src/components/`, `src/hooks/`
- Do NOT modify `vite.config.ts`, `tsconfig.json`, `index.html`
- Do NOT remove `scripts/fetch-seed.mjs` or `scripts/verify-browser.mjs` (still useful)

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: tests-after + existing test suite
- Evidence: .omo/evidence/task-<N>-cleanup-obsolete.<ext>
- After all changes: `npm run typecheck && npm test && npm run build` must pass
- Verify no references to removed artifacts in documentation

## Execution strategy
### Parallel execution waves
Wave 1: Remove directories and files (commandlinetools-linux-*.zip, prometheus/, dist/, docs/)
Wave 2: Update documentation (README.md, AGENTS.md, .gitignore)
Wave 3: Verification (typecheck, test, build)

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1 | - | 2, 3, 4 | - |
| 2 | 1 | 3 | - |
| 3 | 1 | 3 | 2 |
| 4 | 1 | 3 | 2 |
| 5 | 2, 3, 4 | - | - |

## Todos
> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->

- [ ] 1. Remove non-development stray files and directories
  What to do / Must NOT do: Delete the following paths using `rm -rf` or equivalent:
  - `commandlinetools-linux-11076708_latest.zip` (Android SDK tools zip)
  - `prometheus/` (empty directory)
  - `dist/` (build artifact directory)
  - `docs/` (entire directory: megasena-cronograma.md, megasena-plano.md)
  
  Must NOT touch any other files or directories. Must NOT remove android/, capacitor.config.ts, scripts/mobile-preview.mjs, or any Capacitor-related files.
  
  Parallelization: Wave 1 | Blocked by: none | Blocks: 2, 3, 4
  References: commandlinetools-linux-11076708_latest.zip, prometheus/, dist/, docs/
  Acceptance criteria (agent-executable): `ls commandlinetools-linux-11076708_latest.zip prometheus/ dist/ docs/ 2>&1` returns "No such file or directory" for each path
  QA scenarios: happy: all paths removed; failure: verify no accidental deletion of other files (`ls` root directory and confirm expected structure including android/, capacitor.config.ts)
  Evidence: .omo/evidence/task-1-cleanup-obsolete.txt
  Commit: Y | chore(cleanup): remove obsolete files and directories

- [ ] 2. Update README.md
  What to do / Must NOT do:
  - Edit `README.md`:
    - Remove line 83 reference to `docs/` in the structure section
    - Update the structure section to reflect current state (remove `docs/` entry)
  
  Must NOT change the core documentation about how the app works (data flow, seed update, etc.). Must NOT remove any references to Capacitor, Android, or mobile development.
  
  Parallelization: Wave 2 | Blocked by: 1 | Blocks: 5
  References: README.md:70-84
  Acceptance criteria (agent-executable): `grep "docs/" README.md` returns no matches; README is coherent and accurate
  QA scenarios: happy: README reflects current structure; failure: verify no broken references
  Evidence: .omo/evidence/task-2-cleanup-obsolete.txt
  Commit: Y | docs: update README.md to remove obsolete docs/ reference

- [ ] 3. Update AGENTS.md if needed
  What to do / Must NOT do:
  - Review `AGENTS.md` for any references to removed artifacts (docs/)
  - If references to docs/ exist, remove them
  - Ensure the document accurately reflects the current project structure
  
  Must NOT change the core documentation about commands, architecture, testing, or conventions unless they reference removed artifacts. Must NOT remove references to Capacitor, Android, or mobile development.
  
  Parallelization: Wave 2 | Blocked by: 1 | Blocks: 5
  References: AGENTS.md
  Acceptance criteria (agent-executable): `grep "docs/" AGENTS.md` returns no matches (if docs/ was referenced)
  QA scenarios: happy: AGENTS.md is accurate; failure: verify no broken references
  Evidence: .omo/evidence/task-3-cleanup-obsolete.txt
  Commit: Y | docs: update AGENTS.md to remove obsolete references

- [ ] 4. Clean .gitignore
  What to do / Must NOT do:
  - Edit `.gitignore`:
    - Remove lines 7-9 (references to `.omc/` and `progress.txt` - OMC/Ralph artifacts not used)
  
  Must NOT remove entries for `node_modules`, `dist`, `*.local`, `.DS_Store`, `.claude/`.
  
  Parallelization: Wave 2 | Blocked by: 1 | Blocks: 5
  References: .gitignore:7-9
  Acceptance criteria (agent-executable): `.gitignore` does not contain `.omc/` or `progress.txt`; still contains `node_modules`, `dist`, etc.
  QA scenarios: happy: .gitignore is clean; failure: verify no accidental removal of important entries
  Evidence: .omo/evidence/task-4-cleanup-obsolete.txt
  Commit: Y | chore: clean .gitignore of obsolete entries

- [ ] 5. Final verification
  What to do / Must NOT do:
  - Run `npm run typecheck && npm test && npm run build` one final time
  - Verify no references to removed artifacts: `ls docs/ prometheus/ dist/ commandlinetools-linux-*.zip 2>&1` returns "No such file or directory"
  - Verify Capacitor artifacts still exist: `ls android/ capacitor.config.ts scripts/mobile-preview.mjs` succeeds
  - List the final project structure to confirm cleanliness
  - Summarize what was removed and what remains
  
  Must NOT modify any files. This is a read-only verification step.
  
  Parallelization: Wave 3 | Blocked by: 2, 3, 4 | Blocks: none
  References: entire project
  Acceptance criteria (agent-executable): all verification commands pass; typecheck, test, build all succeed
  QA scenarios: happy: clean project, all tests pass, Capacitor artifacts intact; failure: identify any issues
  Evidence: .omo/evidence/task-5-cleanup-obsolete.txt
  Commit: N (verification only)

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [ ] F1. Plan compliance audit
- [ ] F2. Code quality review
- [ ] F3. Real manual QA
- [ ] F4. Scope fidelity

## Commit strategy
- Commit after each logical change (todos 1, 2, 3, 4)
- Use conventional commit format: `chore(cleanup):`, `docs:`
- Verification-only todo (5) does not commit

## Success criteria
- All non-development artifacts removed (commandlinetools-linux-*.zip, docs/, prometheus/, dist/)
- All Capacitor/Android development artifacts preserved
- README.md and AGENTS.md updated and accurate
- .gitignore clean
- All tests pass (`npm test`)
- Typecheck passes (`npm run typecheck`)
- Build succeeds (`npm run build`)
- No behavioral changes to the running app
