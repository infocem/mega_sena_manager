# Design System — LotoHub

Este documento descreve o sistema de design do **LotoHub**: paleta de cores, tipografia, espaçamento, padrões de componentes, acessibilidade e breakpoints responsivos. Todas as variáveis e estilos base residem em `src/index.css`.

O tema é **escuro por padrão** (`color-scheme: dark`) e usa variáveis CSS para garantir consistência visual em toda a aplicação.

---

## 1. Paleta de Cores

A paleta é construída em torno de um fundo escuro profundo com destaque em verde (a cor institucional da Mega-Sena) e um tom âmbar para avisos e estados de atenção.

### Variáveis CSS

| Variável | Valor | Uso |
|----------|-------|-----|
| `--bg` | `#0f1115` | Fundo da página |
| `--panel` | `#181b22` | Fundo de painéis, cards e barras de status |
| `--panel-2` | `#1f232c` | Fundo elevado/secondary (hover de abas, inputs) |
| `--text` | `#e6e8eb` | Texto principal |
| `--muted` | `#9aa1ab` | Texto secundário, legendas, hints |
| `--border` | `#2a2f3a` | Bordas, divisórias, grids de gráficos |
| `--accent` | `#209869` | Cor primária de destaque (botões, abas ativas, barras de gráficos) |
| `--accent-2` | `#2dd58e` | Cor de destaque mais clara (títulos H1, hover, spinner) |
| `--warn` | `#d98324` | Avisos e estados de atenção |

### Cores Semânticas Adicionais

Além das variáveis, o CSS usa algumas cores fixas para estados específicos:

| Contexto | Fundo | Borda | Texto |
|----------|-------|-------|-------|
| Erro | `#21181a` | `#5a2a2a` | `--text` |
| Aviso/Disclaimer | `#1d1a12` | `#4a3a1a` (esquerda: `--warn`) | `--text` |
| Bola de dezena | gradiente `--accent-2` → `--accent` | — | `#04130c` |
| Aba ativa | `--accent` | `--accent` | `#fff` |
| Botão primário | `--accent` | — | `#fff` |

### Modo Escuro

O projeto não possui alternância de tema. O `color-scheme: dark` no `:root` instrui o navegador a renderizar controles nativos (scrollbars, inputs, etc.) no modo escuro. As cores são escolhidas para:

- **Alto contraste** entre `--text` (#e6e8eb) e `--bg` (#0f1115): razão aproximada de 14:1.
- **Contraste moderado** para `--muted` (#9aa1ab) sobre `--panel` (#181b22): adequado para legendas, mas não para texto essencial.
- **Destaque acessível** de `--accent-2` (#2dd58e) sobre `--bg`: usado em títulos e estados focados.

---

## 2. Tipografia

### Família de Fontes

```css
font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
```

A fonte é **nativa do sistema**, garantindo performance, renderização nítida e consistência com a plataforma do usuário. Não há fontes web carregadas.

### Tamanhos e Pesos

| Elemento | Tamanho | Peso | Cor | Outros |
|----------|---------|------|-----|--------|
| `h1` | `1.6rem` | normal (400) | `--accent-2` | `margin: 0` |
| `h2` | padrão (`1rem`) | normal | `--text` | `margin: 1.5rem 0 0.75rem` |
| `h3` | `0.95rem` | normal | `--muted` | `uppercase`, `letter-spacing: 0.04em` |
| Corpo | padrão | normal | `--text` | `line-height: 1.5` |
| `small` | padrão | 400 | `--muted` | — |
| `.muted` | `0.85rem` | normal | `--muted` | — |
| `.barra-status` | `0.85rem` | normal | `--muted` | — |
| `.tabela` | `0.9rem` | normal | `--text` | th peso 500 |
| `.seg__btn` | `0.85rem` | normal | `--text` | — |
| `.btn-regenerar` | `0.95rem` | 600 | `#fff` | — |
| `.jogo__criterio` | `0.75rem` | normal | `--muted` | — |
| `.jogo__explicacao` | `0.82rem` | normal | `--muted` | — |
| Eixos de gráfico | `9px`–`10px` | normal | `--muted` | via Recharts |

### Diretrizes Tipográficas

- Use `h1` apenas para o título principal da página.
- Use `h3` para títulos de painéis e cards; sempre em maiúsculas para manter o ritmo visual.
- Use `.muted` para legendas, explicações e informações de suporte.
- Prefira pesos entre 400 e 600; evite `font-weight: 700` exceto em elementos pequenos e de alta densidade (como as bolas de dezena).

---

## 3. Sistema de Espaçamento

Todos os espaçamentos usam a unidade **rem**, escalando com as preferências de fonte do usuário.

### Escala de Espaçamento

| Valor | Uso Típico |
|-------|------------|
| `0.15rem` | padding de pill/tags |
| `0.2rem` | padding-bottom de itens de lista |
| `0.25rem` | gap pequeno, margem de subtítulo |
| `0.3rem` | padding vertical de células de tabela |
| `0.35rem` | padding vertical de botões segmentados |
| `0.4rem` | padding de inputs |
| `0.5rem` | gap padrão, padding horizontal de células, padding de abas (vertical) |
| `0.6rem` | gap de controles, padding vertical de botão primário |
| `0.7rem` | padding horizontal de botões segmentados |
| `0.75rem` | gap de grid, margem de abas, padding vertical de status bar |
| `0.85rem` | padding de avisos e cards de jogo (vertical) |
| `1rem` | padding padrão de painéis, gap principal de listas, margem de grid |
| `1.2rem` | padding horizontal de botão primário |
| `1.25rem` | padding de estado (erro/carregamento), margem-top de status |
| `1.5rem` | padding-top de `main`, margem-top de estados, margem de H2 |
| `2.5rem` | margem-top de rodapé |
| `4rem` | padding-bottom de `main` |

### Larguras e Limites

| Propriedade | Valor | Uso |
|-------------|-------|-----|
| `max-width` do `main` | `1100px` | Centraliza e limita a largura do conteúdo |
| `min-width` de `.peso` | `140px` | Campos do gerador |
| `min-width` de `.peso--qtd` | `110px` | Campo de quantidade de jogos |
| `width/height` da `.bola` | `38px` | Dezenas sorteadas/sugeridas |
| `width/height` do `.spinner` | `28px` | Indicador de carregamento |

### Bordas e Raios

| Raio | Uso |
|------|-----|
| `6px` | Inputs numéricos |
| `8px` | Abas, avisos, botões segmentados, botão primário |
| `12px` | Painéis, cards de jogo, estado, barra-status |
| `999px` | Pills/tags (`.jogo__criterio`) |
| `50%` | Bolas de dezena e spinner |

---

## 4. Padrões de Componentes

### 4.1 Botões

#### Botão Primário (`.btn-regenerar`)

```css
background: var(--accent);
color: #fff;
border: none;
border-radius: 8px;
padding: 0.6rem 1.2rem;
font-size: 0.95rem;
font-weight: 600;
cursor: pointer;
```

- Hover: `background: var(--accent-2)`.
- Uso: ação principal da página (ex: "Gerar novos jogos").

#### Botão Segmentado (`.seg__btn`)

```css
background: transparent;
color: var(--text);
border: none;
padding: 0.35rem 0.7rem;
font-size: 0.85rem;
cursor: pointer;
```

- Agrupado em `.seg` com `border: 1px solid var(--border)` e `border-radius: 8px`.
- Estado ativo (`.seg__btn--ativo`): fundo `--accent`, texto `#fff`.
- Uso: seleção mutualmente exclusiva (janela de análise).
- Acessibilidade: usar `aria-pressed` no botão ativo.

#### Aba (`.lottery-tabs__tab`)

- Fundo transparente, borda `--border`, `border-radius: 8px`.
- Hover: fundo `--panel-2`.
- Ativa (`.lottery-tabs__tab--active`): fundo/borda `--accent`, texto `#fff`.
- Uso: navegação entre loterias.

### 4.2 Cards e Painéis

#### Painel (`.panel`)

```css
background: var(--panel);
border: 1px solid var(--border);
border-radius: 12px;
padding: 1rem;
```

- Uso: containers do dashboard (gráficos, tabelas, estatísticas).
- Organizados em `.grid` de 2 colunas com `gap: 1rem`.

#### Card de Jogo (`.jogo`)

```css
background: var(--panel);
border: 1px solid var(--border);
border-radius: 12px;
padding: 0.85rem 1rem;
```

- Contém `.jogo__dezenas` (bolas), `.jogo__criterio` (pill) e `.jogo__explicacao`.
- Lista em `.jogos` com `display: grid` e `gap: 0.75rem`.

#### Estado (`.estado`)

```css
display: flex;
gap: 1rem;
align-items: center;
background: var(--panel);
border: 1px solid var(--border);
border-radius: 12px;
padding: 1.25rem;
margin-top: 1.5rem;
```

- Variante de erro (`.estado--erro`): borda `#5a2a2a`, fundo `#21181a`.
- Uso: mensagens de carregamento e erro.

### 4.3 Abas

Componente: `src/components/layout/lottery-tabs.tsx`.

- Estrutura: `<nav>` com `aria-label="Loterias"`, `<ul role="tablist">`.
- Cada item: `<li role="presentation">` com `<Link role="tab" aria-selected={boolean} aria-current={...}>`.
- Estilo: flex com `gap: 0.5rem`; em telas até `720px`, as abas empilham (`flex: 1 1 100%`).
- Estados: hover (`--panel-2`), focus-visible (`outline: 2px solid --accent-2`) e ativa (`--accent`).

### 4.4 Tabelas

Classe `.tabela`:

```css
width: 100%;
border-collapse: collapse;
font-size: 0.9rem;
```

- Células (`th`, `td`): `text-align: left`, `padding: 0.3rem 0.5rem`, `border-bottom: 1px solid var(--border)`.
- Cabeçalho: cor `--muted`, peso 500.
- Uso: maiores atrasos e estatísticas tabulares.

### 4.5 Gráficos

Os gráficos usam **Recharts** com estilização manual para o tema escuro:

- Container: `<ResponsiveContainer width="100%" height={240}>`.
- Grid: `<CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a" />`.
- Tooltip: `background: #181b22`, `border: 1px solid #2a2f3a`.
- Barras: cor primária `--accent` (`#209869`), com destaque âmbar (`--warn`, `#d98324`) para valores de equilíbrio.
- Eixos: ticks de `9px`–`10px` em cor padrão do Recharts (sobreposto pelo tema escuro).

### 4.6 Formulários

#### Range Slider

```css
input[type='range'] {
  accent-color: var(--accent);
}
```

#### Input Numérico

```css
background: var(--panel-2);
color: var(--text);
border: 1px solid var(--border);
border-radius: 6px;
padding: 0.4rem 0.5rem;
```

#### Grupo de Campo (`.peso`)

```css
display: flex;
flex-direction: column;
gap: 0.25rem;
min-width: 140px;
flex: 1;
```

- Label: `font-size: 0.85rem`, cor `--muted`, com valor destacado em `--accent-2` e `font-variant-numeric: tabular-nums`.

### 4.7 Bolas de Dezena (`.bola`)

```css
display: inline-grid;
place-items: center;
width: 38px;
height: 38px;
border-radius: 50%;
background: radial-gradient(circle at 30% 30%, var(--accent-2), var(--accent));
color: #04130c;
font-weight: 700;
font-variant-numeric: tabular-nums;
```

- Usadas para exibir dezenas sorteadas e sugeridas.
- Números alinhados com `tabular-nums` para evitar oscilação de largura.

### 4.8 Spinner (`.spinner`)

```css
width: 28px;
height: 28px;
border: 3px solid var(--border);
border-top-color: var(--accent-2);
border-radius: 50%;
animation: girar 0.8s linear infinite;
```

- Animação `girar` de rotação contínua.
- Uso: indicador de carregamento em estados assíncronos.

---

## 5. Acessibilidade

### Atributos ARIA

- **Navegação por abas**: `<nav aria-label="Loterias">`, `<ul role="tablist">`, links com `role="tab"`, `aria-selected` e `aria-current="page"`.
- **Botões segmentados**: cada botão usa `aria-pressed` para indicar seleção.
- **Tabelas**: uso correto de `<thead>` e `<th>`; leitores de tela anunciam cabeçalhos automaticamente.
- **Seções**: dashboards e grupos semânticos usam `<section>` e `<h2>`–`<h3>` para estrutura de títulos.

### Estados de Foco

- Todos os elementos interativos devem ter foco visível.
- Padrão de foco das abas:

```css
.lottery-tabs__tab:focus-visible {
  outline: 2px solid var(--accent-2);
  outline-offset: 2px;
}
```

- Mantenha o foco visível em botões, links e inputs; não remova `outline` sem substituí-lo por um indicador de foco equivalente.

### Contraste e Legibilidade

- Texto principal (`--text` sobre `--bg` ou `--panel`): contraste superior a 7:1 (WCAG AAA).
- Texto secundário (`--muted`): contraste entre 4.5:1 e 7:1; use apenas para legendas e informações não essenciais.
- Botões primários: texto branco sobre `--accent` possui contraste adequado.

### Animações

- O spinner usa animação CSS; respeite `prefers-reduced-motion` em futuras iterações para usuários sensíveis a movimento.
- Transições de hover são curtas (`0.15s ease`) e não causam distúrbios vestibulares.

### Navegação por Teclado

- Abas são alcançáveis via `Tab` e ativadas por `Enter` (comportamento padrão de `<Link>`).
- Botões segmentados são focáveis e acionáveis por `Enter`/`Space`.
- Inputs de range e número seguem a ordem de tabulação natural.

---

## 6. Breakpoints Responsivos

O design é **mobile-first** com ajustes em dois pontos de quebra principais:

| Breakpoint | Valor | Comportamento |
|------------|-------|---------------|
| Tablet / pequenos desktops | `max-width: 720px` | Grade do dashboard passa para 1 coluna; abas empilham verticalmente; barra de status empilha itens |
| Mobile estreito | `max-width: 480px` | Ponto reservado para ajustes finos em telas muito pequenas (ex: redução de padding, fontes menores) |

### Regras Ativas em `720px`

```css
@media (max-width: 720px) {
  .lottery-tabs__tab {
    flex: 1 1 100%;
  }
  .grid {
    grid-template-columns: 1fr;
  }
  .barra-status {
    flex-direction: column;
    align-items: flex-start;
  }
}
```

### Diretrizes Responsivas

- O `main` tem `max-width: 1100px` e é centralizado; em telas menores, o padding lateral (`1rem`) garante respiro.
- Gráficos mantêm `height: 240px` fixo para estabilidade de layout.
- Abas em mobile ocupam a largura total, facilitando toque.
- Cards e painéis nunca excedem a largura da viewport graças a `box-sizing: border-box` global.

---

## 7. Convenções de Nomenclatura

- **Classes CSS**: padrão BEM-like em inglês.
  - Bloco: `.lottery-tabs`, `.barra-status`, `.gerador-controles`.
  - Elemento: `.lottery-tabs__list`, `.lottery-tabs__tab`, `.jogo__dezenas`.
  - Modificador: `.lottery-tabs__tab--active`, `.seg__btn--ativo`, `.estado--erro`.
- **Variáveis CSS**: nomes simples e semânticos (`--bg`, `--panel`, `--accent`, `--muted`).
- **Componentes React**: `PascalCase` em inglês (`Dashboard`, `Controls`, `SuggestedGames`, `LotteryTabs`).
- **Textos da interface**: em português do Brasil, conforme convenção do projeto.

---

## 8. Boas Práticas

1. **Sempre use as variáveis CSS**; não hardcodie cores de interface.
2. **Mantenha a hierarquia de títulos** (`h1` → `h2` → `h3`) sem pular níveis.
3. **Garanta foco visível** em qualquer elemento interativo novo.
4. **Use `rem` para espaçamentos** e tamanhos relacionados à tipografia.
5. **Teste em `720px` e `480px`** ao adicionar novos componentes.
6. **Respeite o modo escuro**: qualquer cor de fundo deve ter contraste adequado com `--text`.
7. **Documente exceções**: se um componente precisar de cor fixa (como estados de erro ou gráficos), comente o motivo no código.
