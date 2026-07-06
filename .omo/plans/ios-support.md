# ios-support - Work Plan

## TL;DR (For humans)

**O que você vai ter**: Suporte iOS completo via Capacitor, permitindo compilar o app para iPhone/iPad usando Xcode em um Mac.

**Por que essa abordagem**: O projeto já usa Capacitor para Android — adicionar iOS é natural e requer apenas configuração, não reescrita. Zero código nativo customizado significa zero adaptação.

**O que NÃO vai fazer**: CI/CD, publicação na App Store, plugins nativos iOS customizados, código Swift/Objective-C.

**Esforço**: ~5 tarefas, 30-60 minutos de implementação.

**Risco**: Baixo. O Capacitor iOS é maduro e o projeto não usa APIs nativas customizadas.

**Decisões**:
- Build manual (sem CI/CD) — compila quando tiver acesso a um Mac
- Apple ID gratuito — certificado expira em 7 dias (reinstalar via Sideloadly/AltStore)
- ATS configurado para permitir HTTPS à API da Caixa

---

## Scope

### IN
- Instalar `@capacitor/ios` e inicializar a plataforma iOS
- Configurar `Info.plist` para App Transport Security (ATS) — permitir HTTPS à `servicebus2.caixa.gov.br`
- Configurar ícones e splash screen para iOS (via `@capacitor/assets` ou manual)
- Atualizar `capacitor.config.ts` com `iosScheme: 'https'`
- Adicionar scripts npm: `cap:sync:ios`, `cap:open:ios`, `cap:build:ios:debug`, `cap:build:ios:release`
- Documentar o processo de build iOS no README

### OUT
- CI/CD (GitHub Actions, Codemagic)
- Publicação na App Store ou TestFlight
- Plugins nativos iOS customizados
- Código Swift/Objective-C
- Modificações no código web (React/TypeScript)

---

## Verification strategy

### Estratégia de teste: tests-after (agent-executed QA)

Como as mudanças são puramente de configuração (sem lógica de negócio nova), a verificação será:

1. **Typecheck**: `npm run typecheck` deve passar sem erros
2. **Build**: `npm run build` deve completar com sucesso
3. **Cap sync**: `npx cap sync ios` deve completar sem erros (quando executado em Mac)
4. **Estrutura de arquivos**: Verificar que `ios/` foi criado com estrutura correta
5. **Info.plist**: Validar que `NSAppTransportSecurity` está configurado corretamente

---

## Execution strategy

### Ordem de execução
1. **Fundação**: Instalar `@capacitor/ios` (habilita todos os passos seguintes)
2. **Configuração**: Atualizar `capacitor.config.ts` + `Info.plist`
3. **Assets**: Configurar ícones/splash
4. **Scripts**: Adicionar comandos npm
5. **Documentação**: Atualizar README

### Dependências
```
Tarefa 1 (instalar) → Tarefa 2 (config) → Tarefa 3 (assets)
                  ↘ Tarefa 4 (scripts)
                              ↘ Tarefa 5 (docs)
```

---

## Todos

### Tarefa 1: Instalar @capacitor/ios

**Referências**:
- `package.json:19-21` — já tem `@capacitor/android`, `@capacitor/cli`, `@capacitor/core`
- Capacitor docs: `npm install @capacitor/ios`

**Passos**:
1. Executar: `npm install @capacitor/ios`
2. Executar: `npx cap add ios` (cria diretório `ios/` com projeto Xcode)
3. Verificar que `ios/App/App/` foi criado com `Info.plist`, `AppDelegate.swift`, etc.

**Critérios de aceitação**:
- `@capacitor/ios` aparece em `dependencies` no `package.json`
- Diretório `ios/App/App/` existe com estrutura de projeto Xcode
- `npx cap sync ios` completa sem erros

**QA**:
- Happy path: `npm install @capacitor/ios && npx cap add ios` → `ios/` criado
- Failure path: Se `npx cap add ios` falhar, verificar versão do Capacitor e compatibilidade

**Commit**: `feat: adicionar plataforma iOS via Capacitor`

---

### Tarefa 2: Configurar Info.plist para ATS

**Referências**:
- `ios/App/App/Info.plist` — arquivo a ser modificado
- Capacitor docs: ATS configuration para permitir HTTPS
- `src/api/base.ts:3-4` — URL da API Caixa: `https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena`

**Passos**:
1. Abrir `ios/App/App/Info.plist`
2. Adicionar/modificar `NSAppTransportSecurity`:
```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <false/>
  <key>NSExceptionDomains</key>
  <dict>
    <key>servicebus2.caixa.gov.br</key>
    <dict>
      <key>NSIncludesSubdomains</key>
      <true/>
      <key>NSExceptionAllowsInsecureHTTPLoads</key>
      <false/>
      <key>NSExceptionMinimumTLSVersion</key>
      <string>TLSv1.2</string>
    </dict>
  </dict>
</dict>
```

**Critérios de aceitação**:
- `Info.plist` contém `NSAppTransportSecurity` com exceção para `servicebus2.caixa.gov.br`
- `NSAllowsArbitraryLoads` é `false` (segurança)
- `NSExceptionMinimumTLSVersion` é `TLSv1.2`

**QA**:
- Happy path: App iOS consegue fazer fetch da API Caixa via HTTPS
- Failure path: Se fetch falhar, verificar se ATS está bloqueando (logs do Xcode)

**Commit**: `feat: configurar ATS no Info.plist para API da Caixa`

---

### Tarefa 3: Configurar ícones e splash screen

**Referências**:
- Capacitor docs: `@capacitor/assets` para gerar ícones/splash
- `android/app/src/main/res/` — ícones Android existentes (referência)

**Passos**:
1. Verificar se existe diretório `resources/` com imagens fonte (`icon.png`, `splash.png`)
2. Se não existir, criar imagens placeholder ou copiar do Android
3. Executar: `npx @capacitor/assets generate --ios`
4. Verificar que `ios/App/App/Assets.xcassets/` foi populado

**Alternativa manual** (se `@capacitor/assets` não funcionar):
1. Copiar ícones do Android (`android/app/src/main/res/mipmap-*/ic_launcher.png`)
2. Converter para formato iOS (AppIcon.appiconset)
3. Adicionar manualmente em `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

**Critérios de aceitação**:
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/` contém ícones em múltiplas resoluções
- `ios/App/App/Assets.xcassets/Splash.imageset/` contém splash screen
- Xcode reconhece os assets sem warnings

**QA**:
- Happy path: `npx @capacitor/assets generate --ios` → assets gerados
- Failure path: Se assets falharem, usar abordagem manual (copiar do Android)

**Commit**: `feat: adicionar ícones e splash screen para iOS`

---

### Tarefa 4: Atualizar capacitor.config.ts

**Referências**:
- `capacitor.config.ts:1-17` — configuração atual
- Capacitor docs: `iosScheme` para HTTPS

**Passos**:
1. Adicionar `server.iosScheme: 'https'` em `capacitor.config.ts`:
```typescript
const config: CapacitorConfig = {
  appId: 'com.infocem.megasena',
  appName: 'Mega-Sena Manager',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',  // ADICIONAR
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
}
```

**Critérios de aceitação**:
- `capacitor.config.ts` contém `iosScheme: 'https'`
- `npm run typecheck` passa sem erros
- `npx cap sync ios` completa sem erros

**QA**:
- Happy path: Typecheck passa, sync completa
- Failure path: Se typecheck falhar, verificar sintaxe TypeScript

**Commit**: `feat: adicionar iosScheme https na config do Capacitor`

---

### Tarefa 5: Adicionar scripts npm para iOS

**Referências**:
- `package.json:13-16` — scripts Android existentes
- Padrão: `cap:sync`, `cap:open`, `cap:build:debug`, `cap:build:release`

**Passos**:
1. Adicionar scripts em `package.json`:
```json
"cap:sync:ios": "npm run build && npx cap sync ios",
"cap:open:ios": "npm run cap:sync:ios && npx cap open ios",
"cap:build:ios:debug": "npm run cap:sync:ios && cd ios/App && xcodebuild -workspace App.xcworkspace -scheme App -configuration Debug",
"cap:build:ios:release": "npm run cap:sync:ios && cd ios/App && xcodebuild -workspace App.xcworkspace -scheme App -configuration Release"
```

**Critérios de aceitação**:
- `package.json` contém 4 novos scripts iOS
- Scripts seguem o mesmo padrão dos scripts Android
- `npm run cap:sync:ios` completa sem erros (quando executado em Mac)

**QA**:
- Happy path: `npm run cap:sync:ios` → build + sync completam
- Failure path: Se xcodebuild falhar, verificar que Xcode está instalado

**Commit**: `feat: adicionar scripts npm para build iOS`

---

### Tarefa 6: Documentar processo de build iOS no README

**Referências**:
- `README.md:40-50` — seção Android existente
- Padrão: pré-requisitos + comandos

**Passos**:
1. Adicionar seção "### App iOS (Capacitor)" após a seção Android
2. Incluir:
   - Pré-requisitos: macOS + Xcode + Apple ID
   - Comandos: `cap:sync:ios`, `cap:open:ios`, `cap:build:ios:debug`, `cap:build:ios:release`
   - Nota sobre Apple ID gratuito (certificado 7 dias)
   - Nota sobre limitações (sem App Store, sem TestFlight)

**Critérios de aceitação**:
- README contém seção iOS com pré-requisitos e comandos
- Documentação menciona limitações do Apple ID gratuito
- Links para documentação Capacitor iOS

**QA**:
- Happy path: README renderiza corretamente no GitHub
- Failure path: N/A (documentação)

**Commit**: `docs: adicionar documentação de build iOS no README`

---

## Final verification wave

Após todas as tarefas, executar em paralelo:

| Verificação | Comando | Esperado |
|-------------|---------|----------|
| F1: Typecheck | `npm run typecheck` | Exit 0 |
| F2: Build | `npm run build` | Exit 0, `dist/` criado |
| F3: Cap sync | `npx cap sync ios` | Exit 0 (em Mac) |
| F4: Estrutura | `ls ios/App/App/` | `Info.plist`, `AppDelegate.swift`, `Assets.xcassets` |
| F5: ATS | `grep -A 10 NSAppTransportSecurity ios/App/App/Info.plist` | Configuração correta |

**Todas devem passar antes de considerar completo.**

---

## Commit strategy

### Ordem dos commits
1. `feat: adicionar plataforma iOS via Capacitor` (Tarefa 1)
2. `feat: configurar ATS no Info.plist para API da Caixa` (Tarefa 2)
3. `feat: adicionar ícones e splash screen para iOS` (Tarefa 3)
4. `feat: adicionar iosScheme https na config do Capacitor` (Tarefa 4)
5. `feat: adicionar scripts npm para build iOS` (Tarefa 5)
6. `docs: adicionar documentação de build iOS no README` (Tarefa 6)

### Estratégia de branch
- Branch: `feat/ios-support` (já criada)
- Base: `main`
- Merge: PR quando completo

---

## Success criteria

### Definição de pronto
- [ ] `@capacitor/ios` instalado e `ios/` inicializado
- [ ] `Info.plist` configurado com ATS para API Caixa
- [ ] Ícones e splash screen presentes em `Assets.xcassets`
- [ ] `capacitor.config.ts` com `iosScheme: 'https'`
- [ ] 4 scripts npm iOS adicionados
- [ ] README documentado com instruções iOS
- [ ] `npm run typecheck && npm run build` passam
- [ ] `npx cap sync ios` completa sem erros (em Mac)

### O que NÃO é sucesso
- App publicado na App Store
- CI/CD funcionando
- Plugins nativos iOS customizados
- Código Swift/Objective-C escrito
