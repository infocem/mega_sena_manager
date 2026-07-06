# Draft: mobile-android

## Status
- intent: CLEAR
- review_required: false
- status: approved
- approved_at: 2026-07-04

## Decisions
- Abordagem: Capacitor (empacota web app em WebView nativo Android)
- App ID: com.infocem.megasena
- App Name: Mega-Sena Manager
- Capacitor version: 8.x (latest stable)
- androidScheme: https
- CapacitorHttp: enabled (bypass CORS via native HTTP stack)
- Test strategy: TDD for new code (base.ts, capacitor config)
- Dual distribution: web (npm run dev com proxy Vite) + Android APK (Capacitor)
- Same codebase, different build targets

## Components
1. API base conditional (src/api/base.ts) - switch between web proxy URL and native absolute URL
2. Capacitor config (capacitor.config.ts) - app metadata, HTTP plugin, webDir
3. Capacitor install + Android scaffold - npm packages, npx cap add android
4. npm scripts - cap:sync, cap:build:debug, cap:open
5. Storage persistence (optional hardening) - navigator.storage.persist() on boot
6. Tests - TDD for base.ts conditional logic

## Pending action
write .omo/plans/mobile-android.md
