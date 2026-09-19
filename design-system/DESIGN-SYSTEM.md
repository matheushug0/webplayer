# Design System — CineVault Streaming

Extraído de `cinevault-streaming-22.aura.build` (`index.html` + `/assets`). Relatório baseado em evidências: todos os valores listados aparecem no código fonte, com contagem de ocorrências. Tema **somente escuro** (`<meta name="color-scheme" content="dark"/>`).

---

## 1. Resumo e arquitetura de estilização

| Item | Valor encontrado |
|---|---|
| Arquitetura | **Utility-first (Tailwind CSS v3, default theme)** |
| Motor | Site gerado pelo Aura; `assets/resource_3fa48481346f.js` embute o **compilador Tailwind JIT** (build do CDN), que gera o CSS em runtime a partir das classes presentes no HTML |
| Tokens declarados | Não existe `tailwind.config.js` autorado nem bloco `:root`. O site usa apenas o **tema padrão do Tailwind** (paleta/espacamento/raio/breakpoints oficiais) + **utilidades customizadas** via classes arbitrárias (`[...]`) + **2 keyframes e 4 estilos autorados** em `<style>`/JSS |
| Fontes | Google Fonts self-hosted (17 famílias em `css2_*.css`), mas **só 2 são usadas de fato**: `Inter` (body) e `Geist` (UI, classe `.font-geist`) |
| Ícones | **Lucide** via `assets/lucide_latest_*.js` + `lucide.createIcons()` (25 SVGs inline) |
| Imagens | `webp` (13), `jpg` (6), `png` (3) — posters/screenshots/avatares |
| Fundo animado | UnicornStudio WebGL via `cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js` em `div.aura-background-component` |

**Implicação:** para replicar o visual em outro projeto basta consumir o tema padrão do Tailwind (paleta `purple`/`red`/`sky`/`neutral` + `black`/`white`) com as customizações documentadas abaixo (Geist/Inter, animações `fadeSlideIn`, sombras arbitrárias).

---

## 2. Cores

### 2.1 Paleta primitiva (todas do tema padrão Tailwind v3)

| Token | Hex | Uso mais comum | Ocorrências (classes) |
|---|---|---|---|
| `black` | `#000000` | Fundo da página (`bg-black`) e paradas de gradiente | 1 (`bg-black`) + 14 paradas de gradiente |
| `white` | `#ffffff` | Texto e superfícies com opacidade (ver opacidades) | 10 (`text-white`) + `bg-white` 1 |
| `purple-200` | `#e9d5ff` | Texto de badge 4K | 1 |
| `purple-400` | `#a78bfa` | Ícones de check e borda/bg do badge 4K | 4 (`text-purple-400`) + 1 borda + 1 bg |
| `purple-500` | `#a855f7` | Hover de botão primário (`hover:bg-purple-500`) | 1 (+1 no gradiente hover) |
| `purple-600` | `#9333ea` | **Cor primária**: botão "Start watching", CTA dos planos | 2 (`bg-purple-600`) + 1 `from-purple-600` |
| `purple-900` | `#581c87` | Tinta do gradiente de fundo (`from-purple-900/20`) | 1 |
| `red-200` | `#fecaca` | Texto dos badges EXCLUSIVE / NEW ORIGINAL | 2 |
| `red-400` | `#f87171` | Ícones de check do plano Premium e badge EXCLUSIVE | 4 (`text-red-400`) + 1 borda + 1 bg |
| `red-500` | `#ef4444` | Badge NEW ORIGINAL (borda/bg) e hover do gradiente | 1 borda + 1 bg (+1 no gradiente hover) |
| `red-600` | `#dc2626` | **Acento**: extremo do gradiente do CTA Premium/glow | 1 (`to-red-600`) |
| `sky-200` | `#bae6fd` | Texto do badge AUDIO | 1 |
| `sky-400` | `#38bdf8` | Badge AUDIO (borda/bg) | 1 borda + 1 bg |
| `neutral-200` | `#e5e5e5` | Parada `via` do gradiente no CTA "Start Free Trial" | 1 |
| `neutral-400` | `#a3a3a3` | Texto do CTA "Start Free Trial" | 1 |
| `neutral-600` | `#525252` | Borda do CTA "Start Free Trial" | 1 |
| `neutral-800` | `#262626` | Fundo do CTA "Start Free Trial" | 1 |
| `neutral-900` | `#171717` | Fundo do CTA "Start Watching" do nav (`/60`) | 1 |
| `gray` | `#808080` | Esqueleto de loading (`cms-shimmer`: `rgba(128,128,128,.1/.2)`) | 1 bloco CSS |

**Branco com opacidade (superfícies "glass", bordas, texturas) — o coração do visual:**

| Classe | Cor resultante | Ocorrências |
|---|---|---|
| `bg-white/5` | `rgba(255,255,255,0.05)` — superfície de cards/faq | **52** |
| `hover:bg-white/10` | `rgba(255,255,255,0.10)` — hover de botões glass | 11 |
| `border-white/10` | `rgba(255,255,255,0.10)` — borda padrão de cards/botões/alerts | **61** |
| `border-white/20` | `rgba(255,255,255,0.20)` — borda do CTA "Start Watching" | 1 |
| `text-white/90` | `rgba(255,255,255,0.90)` — texto primário | 12 |
| `text-white/80` | `rgba(255,255,255,0.80)` | 17 |
| `text-white/70` | `rgba(255,255,255,0.70)` — corpo de texto | **38** |
| `text-white/60` | `rgba(255,255,255,0.60)` | 5 |
| `text-white/50` | `rgba(255,255,255,0.50)` — rubricas secundárias | 4 |
| `text-white/40` | `rgba(255,255,255,0.40)` — logo/palavras dos "devices" | 6 |
| `ring-black/60` | `rgba(0,0,0,0.60)` — anel dos avatares | 8 |
| `ring-white/10` | `rgba(255,255,255,0.10)` | 1 |
| `opacity-0/50/80` | opacidade de elemento (animações/estados) | 3/1/1 |

### 2.2 Cores semânticas

| Papel | Token | Cor | Onde |
|---|---|---|---|
| **Primária (brand)** | `purple-600` → `purple-500` (hover) | `#9333ea` → `#a855f7` | Botões de ação principal, gradiente de CTA |
| **Acento premium/CTA** | `red-600` | `#dc2626` | Gradiente `purple→red` do plano Premium; glow do card premium |
| **Alerta/Novidade** | `red-400`/`red-500` | `#f87171`/`#ef4444` | Badges "EXCLUSIVE", "NEW ORIGINAL" |
| **Info técnica** | `sky-400` | `#38bdf8` | Badge "AUDIO", ícones |
| **Recurso** | `purple-400` | `#a78bfa` | Badge "4K", checks |
| **Fundo** | `black` | `#000000` | Base da página |
| **Superfície** | `white/5` | `rgba(255,255,255,.05)` | Cards, FAQ, nav em pílula, chips |
| **Texto (primário/secundário/corpo)** | `white/90` / `white/80` / `white/70` | opacidades de `#ffffff` | Títulos → corpo |
| **Texto (muuuto secundário)** | `white/50`–`white/60` | opacidades | Rubricas, legendas, preços `/month` |
| **Borda** | `white/10` | `rgba(255,255,255,.10)` | Todos os cards e botões "glass" |
| **Badge primário (no nav)** | `neutral-900/60` + `white/20` | `rgba(23,23,23,.6)` | CTA "Start Watching" |

### 2.3 Modo escuro

Não é um tema: o site é **100% escuro** (sem `@media (prefers-color-scheme)`). Não há par claro/escuro — o tema claro **não existe** (seletor `[data-theme]`/`.dark`: não encontrado no código analisado).

---

## 3. Tipografia

### 3.1 Famílias e fallbacks

**Em uso no HTML:**

| Família | Literal encontrado | Papel |
|---|---|---|
| `Geist` | `.font-geist { font-family:'Geist', sans-serif !important; }` (133 usos) | **Fonte de UI/headings** — usada na quase totalidade dos componentes; pesos carregados 300–700 |
| `Inter` | `style="font-family:'Inter', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;"` (inline no `<body>`) | **Fonte de corpo** (herdada); pesos carregados 300–600 |

**Carregadas mas NÃO usadas no markup (17 famílias self-hosted em `css2_*.css`):**
Roboto, Montserrat, Poppins, Playfair Display, Instrument Serif, Merriweather, Bricolage Grotesque, Plus Jakarta Sans, Manrope, Space Grotesk, Work Sans, PT Serif, Geist Mono, Space Mono, Quicksand, Nunito (todas com pesos 300–900, `font-display: swap`). Ver Seção 13.

### 3.2 Escala de tamanhos (base `rem` = 16 px — sem override de `font-size` no `html`/`:root`)

| Nível | Valor (px) | Classe | Uso principal |
|---|---|---|---|
| capilha | 11 | `text-[11px]` (6×) | Badges/carimbo "EXCLUSIVE", "4K", "AUDIO" |
| xs | 12 | `text-xs` (21×) | Rubricas da nav, "Most Popular", FAQ, rodapé |
| sm | 14 | `text-sm` (58×) | Botões, descrições de card, menu, links |
| base | 16 | `text-base` (9×) | Parágrafos de ação, subtítulos |
| lg | 18 | `text-lg` (3×) | Títulos de card pequeno, subtítulo hero |
| xl | 20 | `text-xl` (10×) | Títulos de card/categoria, nome do plano |
| 2xl | 24 | `text-2xl` (9×) | Logo/brand, títulos de card |
| 3xl | 30 | `text-3xl` (6×) | Títulos de seção |
| 4xl | 36 | `text-4xl` (3×) + `sm:text-4xl` (5×) | Preços, títulos de artigo |
| 5xl | 48 | `sm:text-5xl` (2×) + `md:text-5xl` (5×) | Títulos de seção |
| 6xl | 60 | `sm:text-6xl` (2×) | Hero (desktop) |
| 7xl | 72 | `md:text-7xl` (1×) | **Hero principal** |
| display custom | 40 | `text-[40px]` (1×) | "Choose your plan" |

Razões entre níveis consecutivos: 12→14 (1.17), 14→16 (1.14), 16→18 (1.125), 18→20 (1.11), 20→24 (1.2), 24→30 (1.25), 30→36 (1.2), 36→48 (1.33), 48→60 (1.25), 60→72 (1.2). Sequência **não é uma escala modular pura** — é a escala padrão do Tailwind (aproximadamente uma razão variável 1.11–1.33), com um degrau arbitrário de `40px` entre 36 e 48 (escala Tailwind não possui `text-[40px]` oficial → ver Seção 13).

### 3.3 Pesos, estilos e espaçamento de letras

| Propriedade | Valores | Ocorrências |
|---|---|---|
| `font-weight` | 400 `font-normal` (2×), **500 `font-medium` (45×)**, 600 `font-semibold` (21×); itálico não usado; 300/700+ disponíveis nas famílias carregadas mas não usadas | — |
| `letter-spacing` | `tracking-tight` = `-0.025em` (22×), `tracking-tighter` = `-0.05em` (10×) — aplicados em todos os títulos | — |
| `line-height` | Padrões do Tailwind por size (xs `1rem` … 3xl `2.25rem`); hero 6xl/7xl `1`; custom único: `leading-[0.95]` (1×, título "Choose your plan") | — |

Padrão observado: **headings = Geist + semibold/medium + tracking-tight/tighter + line-height apertado; corpo = Inter herdado + text-white/70 + medium.**

---

## 4. Espaçamento

Base da grade: **4 px** (`0.25rem`), escala padrão Tailwind. Todos os valores usados:

| Token | px | Exemplos de uso |
|---|---|---|
| `1` | 4 | `gap-1`, `p-1` |
| `1.5` | 6 | `h-1.5 w-1.5` (ponto do badge "Subscription Plans") |
| `2` | 8 | `gap-2` (21×), `px-2`, `mt-2` |
| `2.5` | 10 | `px-2.5` |
| `3` | 12 | `gap-3` (14×), `px-3` (13×), `mt-3` (18×) |
| `3.5` | 14 | `w-3.5 h-3.5` (ícones de check, 8×) |
| `4` | 16 | `p-4`, `px-4`, `mt-4` (16×), ícones `h-4 w-4` (9×) |
| `4.5` | 18 | `w-4.5 h-4.5` (setas dos CTAs — **fora da escala oficial**, ver Seção 13) |
| `5` | 20 | `p-5` (12×), `mt-5`, avatares `w-9... ` |
| `6` | 24 | `p-6`, `pt-6`, `mt-6` (6×), `gap-6` (grids de cards) |
| `7` | 28 | `h-7 w-7` (bolinha "+" do FAQ) |
| `8` | 32 | `p-8`, `mt-8`, `gap-8` (grid de parceiros) |
| `9` | 36 | `w-9 h-9` (avatares, 8×) |
| `10` | 40 | `mt-10` (6×), `pt-10` |
| `11` | 44 | `h-11` (altura do botão de plano) |
| `12` | 48 | `py-12` (footer) |
| `16` | 64 | `pt-16`, `pb-16` (padding de seção) |
| `20` | 80 | `pt-20`, `pb-20` (hero) |
| `24` | 96 | `mt-24` (seção de parceiros) |
| `32` | 128 | `sm:pt-32 md:pb-32` (hero desktop) |

Valores **arbitrários** fora do padrão de passo de 4: `pt-[12px] pr-[20px] pb-[12px] pl-[20px]` (CTA "Start Free Trial" — 12 px e 20 px coincidem com a escala), `h-[1100px]` (bloco de fundo Aura). Nenhum valor "quebrado" do tipo 13 px/22 px foi encontrado.

Goteiras de seção típicas: `mt-16`/`pb-16 pt-16` = 64–64 px vertical; `gap-6` = 24 px entre cards.

---

## 5. Raio de borda

| Token (classe) | Valor | Ocorrências | Uso |
|---|---|---|---|
| `rounded-none` | 0 | — | — |
| `rounded-lg` | **8 px** | 17 | Botões secundários, chips de contorno, detalhamentos internos |
| `rounded-xl` | **12 px** | 8 | CTA dos planos, FAQ, contêineres de destaque |
| `rounded-2xl` | **16 px** | 20 | **Cards principais** (featured, preços, categorias, depoimentos) e imagem hero |
| `rounded-full` | `9999px` | 41 | Pílulas: nav, botões de CTA, badges, avatares, bolinhas |

Extra: `border-radius: 12px` no skeleton de loading (`cms-shimmer`) — não usa token, hardcoded. Raio **varia por canto**? Não — nenhum card usa raio per-corner.

---

## 6. Sombras / elevação

Somente 3 tokens (2 `box-shadow` + 1 `filter`), todos arbitrários no HTML:

| Nível | Valor | Uso |
|---|---|---|
| **Elevação 1 — destaque de botão** (3 camadas) | `0 2.8px 2.2px rgba(0,0,0,0.3), 0 6.7px 5.3px rgba(0,0,0,0.35), 0 12.5px 10px rgba(0,0,0,0.4)` | CTA hero "Start Free Trial" |
| **Elevação 0 — highlight interno** | `inset 0 1px 0 rgba(255,255,255,0.08)` | CTA "Start Watching" no nav (efeito "vidro" topo) |
| **Glow (filter, não shadow)** | `filter: blur(10px) saturate(120%)` sobre `radial-gradient(...rgba(255,255,255,.55), ..., transparent 70%)` | Halo abaixo do CTA "Start Watching" no hover |

Cards **não usam `box-shadow`** — a profundidade vem de borda `white/10` + fundo `white/5` + `backdrop-blur-xl` (véu "frosted glass").

---

## 7. Bordas

| Propriedade | Valores encontrados |
|---|---|
| Largura | `1px` (todos os `border`/`border-t` — 67×) e `2px` (`ring-2` nos avatares, 8×; `ring-1` na imagem de streaming, 1×) |
| Estilo | `solid` (= padrão do Tailwind); nenhum `dashed`/`dotted` |
| Cores | `white/10` (61× — padrão de cards), `white/20` (1× — nav CTA), `neutral-600` (1× — CTA hero), `purple-400/30`, `red-400/30`, `red-500/30`, `sky-400/30` (bordas de badges = cor do documento a 30%) |
| Bordas estruturais | `border-t` (footer e barra inferior dos planos), `border-white/10` |

---

## 8. Breakpoints e grid

Breakpoints = padrão Tailwind (classes `sm:` 640 px · `md:` 768 px · `lg:` 1024 px · `xl:` 1280 px):

| Breakpoint | Ocorrências de prefixo |
|---|---|
| `sm` | 60 |
| `md` | 21 |
| `lg` | 8 |
| `xl` | 1 |
| `2xl` | 0 (não usado) |

**Larguras de container (`max-w`):** `max-w-7xl` = 1280 px (9×, container master com `mx-auto` + `px-4 sm:px-6 lg:px-8`), `max-w-5xl` 1024 px (4×), `max-w-4xl` 896 px (2×), `max-w-3xl` 768 px (2×), `max-w-2xl` 672 px (2×), `max-w-xl` 576 px (1×), `max-w-md` 448 px (1×).

**Grid:** padrão de 12 colunas do Tailwind — `grid-cols-1` (mobile), `sm:grid-cols-3` (parceiros), `md:grid-cols-2` (planos/value), `md:grid-cols-3` (3×, biblioteca/originals/testimonials), `md:grid-cols-4` (footer), `md:grid-cols-6` (parceiros desktop). Goteira: `gap-x-6 gap-y-6` = 24 px (grids principais), `gap-x-8 gap-y-8` = 32 px (parceiros), `gap-2/3/4` em agrupamentos pequenos. Layouts especiais: `grid-cols-2 sm:grid-cols-3 md:grid-cols-6` (parceiros); cards com `md:col-span-2 md:row-span-2` (featured original).

---

## 9. Movimento (transições e animações)

### Animações

| Keyframe | Descrição | Onde/Uso |
|---|---|---|
| `fadeSlideIn` (definido em `<style>` inline) | `opacity 0→1`, `translateY(30px)→0`, `blur(8px)→0` | **35 usos** — todos os blocos de seção via `[animation:fadeSlideIn_1s_ease-out_{0.1–0.6}s_{both|forwards}]`, ativados por `IntersectionObserver` (classe `.animate-on-scroll` + `.animate`; threshold 0.2, rootMargin `0px 0px -10%`) |
| `cms-shimmer` (em `index.html`/JS) | `background-position -200%→200%` de um gradiente `rgba(128,128,128,.1→.2→.1)` | Skeleton de loading de itens CMS (`.cms-loading`, 1.5s infinite, radius 12px) |

### Transições

| Token | Valor | Ocorrências | Uso |
|---|---|---|---|
| fast | `duration-150` | 1 | Micro-interação (`active:scale-[0.98]`) |
| normal | `duration-300` | 2 | Hover de aparecimento (halo dos botões, undeline da nav) |
| slow | `duration-500` | 2 | Texto do CTA (troca de label no hover) |
| custom | `duration-[1000ms]` | 3 | Hover de tradução/subida dos CTAs hero |
| easing | `ease-out` (4×), `ease-in-out` (1×), `ease-[cubic-bezier(0.15,0.83,0.66,1)]` (3×) | — | Curva custom (easeOutExpo ≈) para os CTAs hero |
| propriedades | `transition-all` (5×), `transition`, `transition-opacity`, `transition-[transform]`, `transition-[left,right]` | — | — |

Efeitos de hover típicos: `hover:bg-white/10`, `hover:text-white`, `hover:-translate-y-[3px]` (CTA hero), `group-hover:*` para reveals internos (borda-sublinhada que expande `left/right` 0, label que sobe/desce com blur, gradients que acendem via `opacity`).

---

## 10. Z-index

Valores pequenos e organizados (não há `9999`):

| Valor | Ocorrências | Papel |
|---|---|---|
| `-z-10` | 4 | Fundo (gradiente de página, fundo Aura/UnicornStudio) atrás de tudo |
| `z-0` | 1 | Camada neutra |
| `z-10` | 9 | Conteúdo sobre o fundo / controles sobre gradientes |

Sem camadas de override por componente: o grande halo do CTA usa `z-0`/`z-10` contidos no próprio botão (`relative z-10`, `absolute` com `z-<x>` interno). Cabeçalho não é `sticky`.

---

## 11. Ícones e assets

**Ícones:** biblioteca **Lucide** (bundle `lucide_latest_*.js`, inicializado com `lucide.createIcons()`). 25 SVGs inline, todos com `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, **`stroke-width="2"`**. Tamanhos de renderização observados: **14 px** (`w-3.5 h-3.5` — checks, 8×), **16 px** (`w-4 h-4` e `w-[16px] h-[16px]` — botões/estrelas, 18×), **20 px** (`w-5 h-5` — menu mobile, 9×), 18 px (`w-4.5 h-4.5`, setas dos CTAs — fora da escala). Estrelas de avaliação usam `fill-current` (símbolos cheios) seguido de estilo inline `color: rgb(255,255,255)`. Não há `srcset`/`@2x` nem sprite `<symbol>`.

**Imagens (22 `<img>`):** `webp` 13 (posters de conteúdo/categorias), `jpg` 6 (imagem hero, fotos de gênero), `png` 3 (screenshots "offline/family/ad-free"). **Avatares:** `w-9 h-9 = 36 px`, `rounded-full`, `object-cover`, `ring-2 ring-black/60`. Imagens de conteúdo: `aspect-video` (13×) ou `aspect-[4/3]` (1×), `object-cover`. Logotipo não é imagem — é texto `CineVault` em Geist semibold.

---

## 12. Componentes

### 12.1 Botões

| Variante | Classes base | Fundo/Borda | Texto | Hover | Radius | Shedow |
|---|---|---|---|---|---|---|
| **Primário (fill)** | `inline-flex items-center gap-2 px-4 py-2 text-sm font-medium` | `bg-purple-600` | `text-white` | `hover:bg-purple-500` + `transition` | `rounded-lg` | — |
| **Gradiente (plano)** | `h-11 w-full inline-flex items-center justify-center gap-2 text-sm font-medium` | `bg-gradient-to-r from-purple-600 to-red-600` | `text-white` | `hover:from-purple-500 hover:to-red-500` + `transition` | `rounded-xl` | — |
| **Glass (outline)** | `inline-flex items-center gap-2 text-sm font-medium` | `bg-white/5 border border-white/10 backdrop-blur` | `text-white/90` | `hover:bg-white/10` | `rounded-lg` / `rounded-xl` / `rounded-full` / `rounded-2xl` | — |
| **Ghost (nav pill)** | `px-6 py-3 text-xs rounded-full` | `bg-neutral-900/60 border border-white/20` | `text-white` | `active:scale-[0.98]` + `transition-[transform] duration-150 ease-out`; underline gradiente `group-hover` | `rounded-full` | `inset 0 1px 0 rgba(255,255,255,.08)` |
| **CTA hero "Start Free Trial"** | `inline-flex min-w-[120px] px-[20px] py-[12px] font-medium` | `bg-neutral-800 border border-neutral-600` | `text-neutral-400` (`hover:text-white`) | `hover:-translate-y-[3px]` + troca de label + gradiente inferior | `rounded-full` | 3 camadas `rgba(0,0,0,.3/.35/.4)` |
| **Mobile menu** | `md:hidden inline-flex text-sm font-medium` | `bg-white/5 border border-white/10 backdrop-blur` | `text-white` | — | `rounded-lg` | — |

**Passos de botão (paddings) observados:** pill = `pt-3 pr-6 pb-3 pl-6` (24 px vertical / 24 px horizontal); glass = `pt-2 pr-4 pb-2 pl-4` (16/16) ou `px-4 py-2`; planos = altura fixa `h-11` (44 px). Ícones dentro de botão: 16 px (`h-4 w-4`).

### 12.2 Cards (superfície "glass")

| Propriedade | Valor |
|---|---|
| Fundo | `bg-white/5` |
| Borda | `border border-white/10` |
| Raio | `rounded-2xl` (16 px) |
| Blur | `backdrop-blur` (9×) / `backdrop-blur-xl` (11×) |
| Padding | `p-5 sm:p-6` (20→24 px) ou `p-6` |
| Overflow | `overflow-hidden` |
| Hover | `group cursor-pointer` em cards de biblioteca; lights de gradiente radiais internas no topo (Standard: `rgba(139,92,246,0.14)`; Premium: `rgba(239,68,68,0.16)`) |
| Imagem interna | `aspect-video object-cover w-full` + overlay `bg-gradient-to-t from-black via-black/40 to-transparent` |

Variantes: **featured card** (`md:col-span-2 md:row-span-2`, título `text-2xl sm:text-3xl`), **card de categoria** (img + overlay + `sm:p-6`), **card de plano**, **card de depoimento** (`rounded-2xl` + avatar 36px).

### 12.3 Badges / chips

| Variante | Borda | Fundo | Texto | Raio |
|---|---|---|---|---|
| `NEW ORIGINAL` / `EXCLUSIVE` | `border-red-500/30` / `border-red-400/30` | `bg-red-500/15` / `bg-red-400/15` | `text-red-200` (11 px, `font-medium`) | `rounded-full` |
| `4K` (recurso) | `border-purple-400/30` | `bg-purple-400/15` | `text-purple-200` | `rounded-full` |
| `AUDIO` | `border-sky-400/30` | `bg-sky-400/15` | `text-sky-200` | `rounded-full` |
| Chip de feature ("2 Screens") | `border-white/10` | `bg-white/5` | `text-white/80` | `rounded-lg` |
| Pílula de rubrica ("Library", "FAQ") | `border-white/10` | `bg-white/5` | `text-white/70` + `backdrop-blur` | `rounded-full` |

Padrão: **chips/badges = cor do documento a 30% (borda) e 15% (fundo), texto 200**.

### 12.4 Navegação

- Links desktop (`hidden md:flex`): `text-sm font-medium text-white/80 hover:text-white`, dentro de uma **pílula glass** (`rounded-full bg-white/5 border border-white/10 p-1 backdrop-blur-lg`), com espaçamento `pt-2 pr-3 pb-2 pl-3`, separação `md:gap-x-2`.
- CTA à direita (botão "Start Watching", ver 12.1) com halo radial que surge no hover.
- Mobile: botão hambúrguer glass com ícone Lucide 20 px.

### 12.5 FAQ (accordion)

`<details class="group">` glass — `rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5`; `summary` com ícone "+" Lucide 16 px em bolinha `h-7 w-7 rounded-full border border-white/10 bg-white/5 text-white/70`, com `transition group-open:rotate-45` (gira 45°). Resposta: `mt-3 text-sm text-white/70`.

### 12.6 Contêiner de seção / títulos

Seções: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16`; fundo varia com gradiente de divisor `linear-gradient(transparent, rgba(139,92,246,0.05), transparent)`. Título de seção: rubrica (badge pill), `h2 text-3xl sm:text-4xl md:text-5xl font-geist tracking-tighter mt-4`, descrição `mt-4 text-base text-white/70`.

---

## 13. Inconsistências observadas

1. **17 famílias de fonte carregadas e não usadas** — o `<head>` injeta sheets `all-fonts-link-font-*` para Roboto, Montserrat, Poppins, Playfair Display, Instrument Serif, Merriweather, Bricolage Grotesque, Plus Jakarta Sans, Manrope, Space Grotesk, Work Sans, PT Serif, Geist Mono, Space Mono, Quicksand, Nunito; só `Geist` e `Inter` aparecem no HTML (133 usos de `.font-geist`; Inter no body). Eliminá-las reduz 17 requests e ~99 woff2.
2. **`w-4.5 h-4.5` (18 px)** fora do espaçamento oficial Tailwind — usado 2× nas setas dos CTAs de plano; se o runtime não tiver tema estendido, a classe não resolve.
3. **`text-[40px]`** fora da escala — único degrau arbitrário entre 36 e 48.
4. **`border-radius: 12px` hardcoded** no skeleton `cms-shimmer`, fora do conjunto `rounded-*` do site.
5. **Sombras sem token** — os 3 efeitos de sombra (2 `box-shadow` + 1 `filter`) estão todos como classes arbitrárias `shadow-[...]`, não como tokens reutilizáveis.
6. **`opacity-50`** (bloco de social proof "Rated 4.9") não segue o padrão de opacidade de `text-white/*`.
7. **Paleta desbalanceada** — 133 usos de `font-geist` vs nenhum uso das demais fontes indica que a família de UI veio de outra configuração (interfaces Aura expõem todas as fontes candidatas, mas só uma foi aplicada).
8. **Animações com play-state paused classificado**: `.animate-on-scroll { animation-play-state: paused }` acoplado a `IntersectionObserver` — conteúdo com `animation-fill-mode` `forwards` e `opacity-0` inicial só aparece quando o JS roda; sem JS o conteúdo ficaria invisível (não há fallback).
9. **`h-[1100px]` / `-z-10`** no wrapper de fundo é tamanho fixo arbitrário do componente de fundo Aura.

---

## Checklist de extração

- [x] Toda cor com hex + contagem
- [x] Escala tipográfica ordenada e razões verificadas (1.11–1.33, com degrau fora de escala)
- [x] Espaçamento com base 4 px + exceções listadas
- [x] Sombras agrupadas em níveis + z-index categorizado
- [x] Tabelas de estados/variantes para botão, card, badges
- [x] Seção 13 (inconsistências) preenchida
- [x] `design-tokens.json` gerado e consistente com este relatório