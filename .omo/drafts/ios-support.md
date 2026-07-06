# Draft: iOS Support

## Intent
- **intent**: clear
- **review_required**: false

## Decisões já tomadas
- Sem Mac → config local, build manual quando tiver acesso
- Uso pessoal → Apple ID gratuito (certificado 7 dias)
- Capacitor iOS (mesma stack do Android)
- Sem CI/CD (GitHub Actions, Codemagic)

## Componentes
| ID | Componente | Status | Evidência |
|----|-----------|--------|-----------|
| 1 | Instalar @capacitor/ios | pending | package.json |
| 2 | Configurar Info.plist (ATS) | pending | docs Capacitor |
| 3 | Configurar ícones/splash | pending | @capacitor/assets |
| 4 | Atualizar capacitor.config.ts | pending | capacitor.config.ts |
| 5 | Adicionar scripts npm | pending | package.json |
| 6 | Documentar no README | pending | README.md |

## Status
- status: approved
- pending action: write .omo/plans/ios-support.md
- approach: Capacitor iOS + config local
