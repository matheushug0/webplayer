# Design System — Donghua Stream (ETERNALSTREAM)

Fonte analisada: `anime-streaming-81.aura.build` (`index.html` + `assets/`). Extração baseada em evidências: cada valor vem do código e tem contagem de ocorrências.

## 1. Resumo e arquitetura de estilos

**Arquitetura: utility-first (Tailwind CSS) via CDN do Play, sem arquivo de build.**

- O Tailwind é compilado em runtime (o script `assets/resource_3fa48481346f.js` é o compilador oficial do Play CDN).
- **O design system declarado vive no `tailwind.config` inline** no `<head>` do `index.html` (script `tw`), não em um `tailwind.config.js`. Essa é a fonte de verdade para os tokens nomeados.
- Complementado por CSS customizado inline (`<style>`): scrollbar, `qi-bg`, `neon-glow`, `text-glow`, `card-poster`, `card-content`, `ink-overlay`, e o fix de scroll offline (`data-scroll-fix`).
- `assets/css2_b859db58666a.css` contém **apenas** `@font-face` (Google Fonts: Cinzel e Inter) — nenhum token de layout.
- Tema dark-only: não existe variante de tema claro nem `prefers-color-scheme`.
- Implicação: para estender o sistema, edite o `tailwind.config` inline; para novas páginas, use as classes utilitárias idênticas às contadas abaixo.

```
tailwind.config = { theme: { extend: { colors: { void, charcoal, cinnabar, neon },
  fontFamily: { sans: [Inter], display: [Cinzel] },
  backgroundImage: { 'mystic-gradient': radial-gradient(circle at top, #1a1a1a 0%, #050505 50%) } } } }
```

## 2. Cores

### 2.1 Paleta primitiva

Base `dark-first`. Todas as cores são escuras/quentes; o acento é vermelho.

| Token | Hex | Retorno RGB | Uso mais comum | Ocorrências |
|---|---|---|---|---|
| `void` | `#050505` | rgb(5,5,5) | fundo base (body, qi-bg, scrollbar-track, gradients do hero/nav) | 8 |
| `charcoal` | `#121212` | rgb(18,18,18) | superfície de cards e sidebar (`bg-charcoal`) e avatar (`from-charcoal`) | 7 |
| `cinnabar` | `#E60023` | rgb(230,0,35) | origem dos gradientes vermelhos (logo, aura de card, footer) | 7 |
| `neon` | `#FF334B` | rgb(255,51,75) | **cor de marca**: CTAs, ratings, destaque, glows | 33+ (utilitários) |
| `zinc-800` (default) | `#27272a` | rgb(39,39,42) | final do gradiente do avatar | 1 |
| `black` (default) | `#000000` | — | fundos do player, overlays, gradientes `from-black` | 19 |
| `white` (default) | `#ffffff` | — | texto primário + tintas `white/xx` (ver 2.2) | 70+ |

Arbitrários (fora da configuração):
| Valor | Uso | Ocorrências |
|---|---|---|
| `#0a0a0a` | fundo da seção "Theater Mode" (`bg-[#0a0a0a]`) | 1 |
| `#151515` | cabeçalho da playlist (`bg-[#151515]`) | 1 |
| `#333333` | thumb da scrollbar (`::webkit-scrollbar-thumb`) | 1 |
| `#1a1a1a` | padrão SVG do qi-bg e topo do mystic-gradient | 2 |

### 2.2 Cores semânticas

O branco é usado como escala de opacidade para hierarquia de texto e superfícies. `50/xx` drivados de `#ffffff`.

| Papel | Valor | Classe / propriedade | Ocorrências |
|---|---|---|---|
| Primary / destaque | `#FF334B` | `text-neon`, `bg-neon`, `border-neon/20` | acento global |
| Texto primário | `white` | `text-white` | 25 |
| Texto secundário | `white/90` | `text-white/90` | 6 |
| Texto terciário | `white/70–80` | `text-white/80` (4), `text-white/70` (5) | 9 |
| Texto secundário suave | `white/60` | `text-white/60` (8), nav-placeholder | — |
| Texto desabilitado/meta | `white/40–50` | `text-white/40` (11), `text-white/50` (9) | 20 |
| Texto auxiliar (débil) | `white/20–30` | `text-white/20` (1), `text-white/30` (1) | 2 |
| Superfície translúcida | `white/5` | `bg-white/5` (4), `hover:bg-white/5` (4) | 8 |
| Borda padrão | `white/5` | `border-white/5` | 11 |
| Borda elevada | `white/10` | `border-white/10` | 6 |
| Borda de acento | `neon/20–50` | `border-neon/20` (2), `border-neon/30` (1), `hover:border-neon/50` (1) | 4 |
| Gradiente título | `white → white/60` | hero title `bg-clip-text` | 1 |
| Gradientes pôster | `black → black/80 → transparent` | overlay hover | 5 |
| Gradiente logo/aura | `cinnabar → neon` | `from-cinnabar to-neon` | 7 para `to-neon`, 7 para `from-cinnabar` |
| Gradiente de fundo | `#1a1a1a → #050505` | `mystic-gradient` (config) | 1 |
| Erro/sucesso/aviso | — | não encontrado no código analisado | — |

### 2.3 Dark mode

O site **não tem pares claro/escuro**: é um tema 100% dark-only. Não há `@media (prefers-color-scheme)`, classe `.dark`, nem `data-theme`. Não há variante clara a documentar.

## 3. Tipografia

### 3.1 Famílias e fallbacks

| Papel | Família | Fallback | Carga | Pesos carregados |
|---|---|---|---|---|
| Sans (corpo/UI) | Inter | `sans-serif` | `@font-face` local (7 subsetes: cyrillic-ext, cyrillic, greek-ext, greek, vietnamese, latin-ext, latin) | 300, 400, 500, 600 |
| Display (títulos) | Cinzel | `serif` | `@font-face` local (latin, latin-ext) | 400, 600, 800 |
| Mono (timestamps) | mono (default Tailwind) | `ui-monospace, SFMono…` | não carregado como arquivo | — |
| Fontes | Google Fonts self-hosted (17 famílias em `css2_*.css`), mas **só 2 são usadas de fato**: `Inter` (body) e `Geist` (UI, classe `.font-geist`) |

### 3.2 Escala de tamanhos

Base rem verificada: **16px** (nenhum `html`/`:root` redefine `font-size`). Escala = mix da escala default do Tailwind + 2 passos arbitrários (`8px`, `10px`).

| Nível | px | Classe | Uso | line-height | weight |
|---|---|---|---|---|---|
| 1 | 8px | `text-[8px]` | badge "PRO" | — | — |
| 2 | 10px | `text-[10px]` | copyright, subtítulo de episódio | — | — |
| xs | 12px | `text-xs` | badges, meta de card, playlist, footer | — | 500–600 |
| sm | 14px | `text-sm` | nav, botões, títulos de card | — | 400–600 |
| base | 16px | `text-base` | sinopse (responde) | 1.625 (leading-relaxed) | 300 |
| lg | 18px | `text-lg` | título do card, logo nav | 1.25 (leading-tight) | 600 |
| xl | 20px | `text-xl` | título "Theater Mode" | — | 600 |
| 2xl | 24px | `text-2xl` | título de seção (Trending) | 1.25 | 600 |
| 5xl | 48px | `text-5xl` | título do hero (móvel) | 1 (leading-none) | 700 |
| 7xl | 72px | `text-7xl` (≥md) | título do hero | 1 | 700 |
| 8xl | 96px | `text-8xl` (≥lg) | título do hero | 1 | 700 |

Razão entre passos: 8→10 (1.25), 10→12 (1.2), 12→14 (1.166), 14→16 (1.142), 16→18 (1.125), 18→20 (1.111), 20→24 (1.2), 24→48 (2.0), 48→72 (1.5), 72→96 (1.333). **Não é uma escala modular pura** — os saltos 24→48→72→96 são incrementos gráficos do hero, não contínuos.

### 3.3 Pesos e estilos

| Peso | Classe | Onde |
|---|---|---|
| 300 (light) | `font-light` | sinopse do hero |
| 400 (regular) | normal | texto corrido/meta |
| 500 (medium) | `font-medium` | títulos de card, badges, texto de botões secundários |
| 600 (semibold) | `font-semibold` | títulos, labels, botão primary |
| 700 (bold) | `font-bold` | título do hero (`font-display`) |

`font-style`: apenas `normal` (nenhum itálico). `uppercase` usado em badges do hero e logo. Letter-spacing: `tracking-tighter` −0.05em (hero), `tracking-tight` −0.025em (títulos), `tracking-wide` +0.025em (nav), `tracking-wider` +0.05em (badges), `tracking-widest` +0.1em (logo footer), `tracking-[0.2em]` (logo nav).

**Inconsistência de peso**: o título externo usa `font-bold` (700), mas o webfont Cinzel local carrega apenas 400/600/800 → o 700 é sintetizado pelo navegador (pareceria com 800).

## 4. Espaçamento

**Base: 4px** (escala default do Tailwind). Todos os valores vêm do HTML:

| Token (Tailwind) | px | Onde |
|---|---|---|
| `0.5` / `-inset-0.5` | 2 | aura do card |
| `1` (incl. `w-1`, `h-1`, `px-1`, `py-1`, `mt-1`, `mb-1`, `ml-1`, `space-y-1`, `gap-`…) | 4 | separaçőes mínimas, progress bar |
| `1.5` | 6 | dot indicador (`w-1.5 h-1.5`) |
| `2` | 8 | gaps de ícones, `p-2`, `px-2`, `ml-2` |
| `3` | 12 | itens de playlist, `mt-3`, `gap-3` |
| `4` | 16 | `p-4`, `px-4`, `pt-4`, `py-4`, `gap-4` |
| `6` | 24 | `px-6`, `p-6`, `mb-6`, `gap-6`, `space-y-6` |
| `8` | 32 | `px-8`, `gap-8`, `md:px-8` |
| `10` | 40 | carrossel button `w-10 h-10`, `mb-10` |
| `12` | 48 | `py-12`, play icon `w-12 h-12` |
| `14` | 56 | thumbnail `h-14` |
| `20` | 80 | nav `h-20`, `py-20`, play grande `w-20 h-20` |
| `24` | 96 | thumbnail `w-24` |
| `32` | 128 | `pb-32` (hero) |

Off-scale (valores arbitrários `[...]`): `lg:h-[700px]`, `h-[90vh]`, `lg:w-[350px]`, `w-[65%]`, `w-1.5` (6px). Não seguem a escala de 4px — consistem em dimensões estruturais (player, sidebar), não em espaçamento interno.

## 5. Border radius

| Nível | Valor | Onde / ocorrências |
|---|---|---|
| `rounded` (sm) | 4px | badges, botões, thumbs de episódio — 17 |
| `rounded-lg` | 8px | containers: card de pôster, player, sidebar do teatro — 8 |
| `rounded-full` | 9999px | círculos: logo, avatar, botões de carrossel, play buttons, knob do progress — 13 |
| `rounded` por canto | — | ningún (não há canto único aplicado; os containers usam `rounded-lg` inteiro) |

`border-radius: 12px` aparece apenas no `.cms-loading` (artefato do CMS), fora do sistema.

## 6. Sombras / elevação

| Nível | Valor | Onde |
|---|---|---|
| card | `shadow-2xl` (0 25px 50px -12px rgb(0 0 0/.25)) | cards de pôster, player — 6 |
| play/dropdown | `shadow-lg` | play icon central, controles do player — 5 |
| **neon-glow** (custom) | `0 0 10px rgba(255,51,75,.5), 0 0 20px rgba(255,51,75,.2)` | logo, dot, play grande, progress fill — 4 usos + base no `<style>` |
| glow botão primary | `0 0 30px rgba(255,51,75,.3)` → hover `0 0 50px rgba(255,51,75,.5)` | botão PLAY NOW (arbitrários `shadow-[...]`) |
| glow knob | `0 0 10px #FF334B` | knob do progress bar (arbitrário) |
| drop-shadow (filter) | `drop-shadow-2xl` | título do hero — 1 |
| text-glow (custom) | `text-shadow: 0 0 10px rgba(255,51,75,.4)` | classe `.text-glow` (definida, sem uso no HTML) |

Nível "none" (0): estados padrão de cards usam `shadow-2xl` direto; não há shadow de tooltip/modal (não há modal).

## 7. Bordas

- Espessura: **1px** (`border`). 2px: nenhum uso.
- Estilo: **solid** apenas.
- Cores (da mais para a menos frequente): `white/5` (11), `white/10` (6), `neon/20` (2), `neon/30` (1), hover `neon/50` (1), hover `white/20` (1), hover `white/30` (2).
- Direções: `border-t` (2), `border-b` (2), bordas completas, `border-none` não usado.

## 8. Breakpoints e grid

Variantes usadas: `md` (**768px**) e `lg` (**1024px**) — defaults do Tailwind, não reconfigurados. O Play CDN também emite inline um fix `@media (max-width: 639px)` (sm) para quebra de grids em mobile.

Containers:
| Classe | Largura | Onde |
|---|---|---|
| `max-w-7xl` | 1280px | nav, hero, trending, footer — 4 |
| `max-w-[1600px]` | 1600px | seção Theater Mode |
| `max-w-3xl` | 768px | bloco de conteúdo do hero |
| `max-w-xl` | 576px | sinopse |

Grid:
| Grid | Colunas | Uso |
|---|---|---|
| `grid grid-cols-2` | 2 | pôsters (mobile) |
| `md:grid-cols-3` | 3 | pôsters (tablet) |
| `lg:grid-cols-5` | 5 | pôsters (desktop) |
| gutter | `gap-6` = 24px | pôsters |
| `grid` colapsado | `minmax(0,1fr)` | fix responsivo do Play CDN < 640px |

Layout theater: `flex-col lg:flex-row` com `lg:h-[700px]`, player `flex-1` + sidebar `lg:w-[350px]`, `gap-6`.

## 9. Motion (transições e animações)

| Tier | Duração | Onde |
|---|---|---|
| fast | 300ms | hovers de cor/borda/opacidade (`duration-300`, ease default) |
| normal | 500ms (+ `delay-100`) | fade de overlays em grupo, opacidade do aura, aparecimento do play |
| slow | 700ms | sweep de brilho do botão PLAY NOW |
| custom card | 0.5s `cubic-bezier(0.25,0.46,0.45,0.94)` (transform), 0.3s ease (filter) | `.card-poster` (zoom + brightness no hover) |
| custom content | 0.4s `cubic-bezier(0.16,1,0.3,1)` (transform), 0.4s ease (opacity) | `.card-content` (slide + fade no hover) |

Propriedades: `transition-colors` (20), `transition-opacity` (20), `transition-all` (11), `transition-transform` (2), `duration-300` (13), `duration-500` (10), `duration-700` (1), `delay-100` (5), `ease-in-out` (1). `html.scroll-smooth` para rolagem suave de âncoras.

Animações:
| Nome | Tipo | Onde |
|---|---|---|
| Tailwind `animate-pulse` | keyframes default do Play CDN | dot de seção (2: hero badge + dot trending) e play da playlist |
| `animate-pulse-slow` | **classe usada mas não definida** (nem config, nem CSS) — sem efeito | imagem do hero |
| `animate-fade-in-up` | **classe usada mas não definida** — sem efeito | bloco de conteúdo do hero |
| `@keyframes cms-shimmer` | shimmer 1.5s infinite | `.cms-loading` (artefato do CMS de preview, fora do contexto da página renderizada) |
| Hover padrão (combinados) | scale 1.05 + brightness 0.4 (pôster), translateY (overlay), opacity 0→1 (aura/overlay `blur-xl`) | cards |

## 10. Z-index

| Valor | Papel | Onde |
|---|---|---|
| `z-10` | conteúdo do hero | texto + CTAs sobre a imagem de fundo |
| `z-20` | seção Trending | sobre a seção do hero |
| `z-50` | header fixo | nav `fixed top-0 w-full z-50` |

Escala pequena e organizada (10/20/50). Não há valores arbitrários (ex: 9999999).

## 11. Ícones e assets

**Fonte de ícones: Iconify + conjunto Lucide** (`iconify` web component, `icon="lucide:*"`, stroke-based). Ícones usados: `sword` (logo), `search`, `bell`, `chevron-left`, `chevron-right`, `play`, `plus`, `tv`, `skip-forward`, `message-square`, `settings`, `maximize`, `bar-chart-2` (13 ícones).

| Tamanho | Onde | Ocorrências |
|---|---|---|
| 14px | logo do footer | 1 |
| 16px | indicador "now playing" da playlist | 1 |
| 18px | ícones de botão (play, plus) | 2 |
| 20px | ícones de nav/ações, carrossel, transporte do player, play central | ~10 |
| 32px | play grande do player | 1 |

`stroke-width="1.5"` (traço fino) apenas nos ícones do header (sword, search, bell); demais usam o default do Lucide. `fill="currentColor"` aplicado aos ícones `play`. Tamanho "padrão" observado: **20px**.

Imagens: **12 `.avif`** (fotografias de pôster/hero/thumb) + **3 `.jpg`** (pôsters "Battle Heavens", "Perfect World", "Battle of the Gods"). Sem `@2x/@3x`, sem `srcset`, sem sprite SVG externa. Único SVG é o padrão qi (data-uri inline, fill `#1a1a1a` @ 0.1, malha 60×60). Nenhum logo em arquivo — o logo é composto por classes (quadrado rotacionado 45° `from-cinnabar to-neon` + sword).

## 12. Componentes

### 12.1 Botão primary (PLAY NOW)
`bg-neon text-white font-semibold text-sm tracking-wide px-8 py-4 rounded overflow-hidden shadow-glow`

| Estado | Mudanças |
|---|---|
| default | `bg-neon`, glow `0 0 30px rgba(255,51,75,.3)` |
| hover | via combinação: sweep branco atravessa (`translate-x-[-100%]→[100%]`, `duration-700`), glow aumenta para `0 0 50px rgba(255,51,75,.5)` (`hover:shadow-[...]`) |
| active/focus/disabled | não definido no HTML (sem `:active`, `:focus-visible`, `:disabled`) |

### 12.2 Botão secondary / ghost (ADD TO LIST)
`bg-white/5 backdrop-blur-md border border-white/10 text-white font-medium text-sm px-8 py-4 rounded`

| Estado | Mudanças |
|---|---|
| default | `bg-white/5`, `border-white/10`, `text-white` |
| hover | `hover:bg-white/10 hover:border-white/20` (elevação suave) |
| active/focus/disabled | não definido |

### 12.3 Botão de ícone (carrossel)
`w-10 h-10 rounded-full border border-white/10 text-white/50`

| Estado | Mudanças |
|---|---|
| default | borda `white/10`, texto `white/50` |
| hover | `hover:border-white/30 hover:text-white` |

### 12.4 Transport controls do player
`text-white hover:text-neon transition-colors` — ícones 20px Lucide.

### 12.5 Nav bar
`fixed top-0 w-full z-50 transition-all duration-300 bg-void/70 backdrop-blur-md border-b border-white/5`, altura `h-20`, conteúdo `max-w-7xl px-6`.

- Link (inativo): `text-sm font-medium tracking-wide text-white/60`, hover → `text-neon`.
- Link (ativo/"Home"): `text-white`, hover → `text-neon`.
- Ícone de ação (search/bell): `text-white/60`, hover → `text-white`, 20px, `cursor-pointer`.
- Avatar: `w-8 h-8 rounded-full bg-gradient-to-br from-charcoal to-zinc-800 border-white/10`, hover → `hover:border-neon/50`.
- Logo: quadrado `w-8 h-8 rounded-lg rotate-45 from-cinnabar to-neon neon-glow`, sword 20px rotacionado −45°, texto `font-display font-semibold text-lg tracking-[0.2em]` com sufixo `text-neon`.

### 12.6 Badge / chip (hero meta)
`px-2 py-1 rounded backdrop-blur-sm text-xs font-semibold tracking-wider uppercase`

| Variante | Aparência |
|---|---|
| destaque ("4K Quality") | `bg-neon/10 border border-neon/20 text-neon` |
| neutra ("Cultivation", "Updated Ep. 254") | `bg-white/5 border border-white/10 text-white/70` |

### 12.7 Card de pôster (Trending)
Container `.group relative aspect-[2/3] cursor-pointer`; interno `bg-charcoal rounded-lg border-white/5 shadow-2xl overflow-hidden`; aura atrás `bg-gradient-to-b from-cinnabar to-neon opacity-0 blur-xl` (fica visível no hover via `.spirit-aura`).

| Estado | Mudanças |
|---|---|
| default | pôster visível com `card-poster`; overlay oculto |
| hover (grupo) | `.group:hover .card-poster { transform: scale(1.05); filter: brightness(0.4) }`; aura `opacity: 1`; overlay `from-black via-black/80` aparece (`opacity 0→100`, 300ms); título escondido no rodapé (`opacity-100→0`); play central `w-12 h-12 rounded-full bg-neon/90 shadow-lg` surge com `scale`/`delay-100` |
| conteúdo do hover | `.card-content` desliza de `translate-y-4 → translate-y-0` (0.4s, ease-out exponencial) |
| título default | `font-medium text-sm text-white/90 truncate`; meta `text-xs text-white/40` |

### 12.8 Título do hero (SOUL LAND)
`font-display font-bold text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-2xl`.

### 12.9 Seção de títulos
`font-display font-semibold text-2xl md:text-xl text-white tracking-tight` — acompanhada de dot `w-1.5 h-1.5 rounded-full bg-neon neon-glow animate-pulse`.

### 12.10 Player / "Theater Mode"
- Player: `flex-1 relative bg-black rounded-lg border-white/5 shadow-2xl`, imagem `opacity-60`.
- Play grande: `w-20 h-20 bg-neon/20 backdrop-blur-sm rounded-full border-neon/30 neon-glow`, hover `bg-neon/40`; play 32px.
- Controls overlay: `bg-gradient-to-t from-black/90 to-transparent`, sobe no hover (`translate-y-4→translate-y-0`).
- Progress bar: `h-1 bg-white/20 rounded-full`, fill `bg-neon rounded-full neon-glow` com knob branco `w-3 h-3 shadow-[0_0_10px_#FF334B]` (aparece no `group/progress:hover`).
- Tempo: `text-xs font-mono text-white/70`, separador `text-white/30`.

### 12.11 Playlist / "Up Next" (sidebar `lg:w-[350px] bg-charcoal rounded-lg border-white/5`)
- Item ativo: `bg-white/5 border border-neon/20`, título `text-xs font-semibold text-neon`, indicador `bar-chart-2` 16px `animate-pulse`.
- Item inativo: `hover:bg-white/5`; título `text-xs font-medium text-white/80 group-hover:text-white`; thumb `w-24 h-14 rounded bg-black` com imagem `opacity-40 group-hover:opacity-60`; badge PRO `bg-black/80 text-[8px] text-white/70`.
- Header: `p-4 border-b border-white/5 bg-[#151515]`.

### 12.12 Footer
`bg-black/80 backdrop-blur border-t border-white/5 py-12`; logo mini (24px), links `text-xs text-white/40 hover:text-neon`, copyright `text-[10px] text-white/20`.

## 13. Inconsistências observadas

1. **Classes de animação órfãs**: `animate-pulse-slow` e `animate-fade-in-up` são usadas no hero, mas **não estão definidas** no `tailwind.config`, no CSS customizado nem nos keyframes → nenhum efeito real (e `fade-in-up` sugere intenção de animação de entrada que não foi entregue).
2. **`font-bold` (700) no título hero sem webfont**: Cinzel carrega apenas 400/600/800 → o 700 é sintetizado. Classificar como 800 (`font-extrabold`) ou carregar o peso 700.
3. **Glow duplicado por abordagens**: o acento neon existe como token (`neon`), como CSS customizado (`neon-glow`, `text-glow`), e como valores arbitrários (`shadow-[0_0_30px…]`, `hover:shadow-[0_0_50px…]`, `shadow-[0_0_10px_#FF334B]`). Existem 4 formas de expressar o mesmo token — consolidar em `neon-glow` + variantes (sm/md/lg) e remover os arbitrários.
4. **Cor definida sem uso**: `.text-glow` (text-shadow) é definida no `<style>` mas nenhum elemento a usa no HTML.
5. **Cores arbitrárias fora do tema**: `#0a0a0a` (fundo Theater Mode) e `#151515` (header playlist) competem com `void`/`charcoal`; `zinc-800` é default do Tailwind não declarado na config. Estas são as candidatas a virar tokens (`bg-ink-900`-like) se quiser consistência.
6. **`rounded` misto**: cards usam `rounded-lg` (8px) enquanto botões/badges usam `rounded` (4px) — consistente, porém a diferença não é nomeada (nenhum token `radius.sm/md/lg`).
7. **12px em `.cms-loading`**: raio de 12px e crayons degradé shimmer pertencem ao artefato do CMS de preview, não ao sistema — vazam para o report apenas como observação.
8. **Sem estados de foco/desabilitado**: nenhum componente define `:focus-visible`, `:active` ou `:disabled` — acessibilidade de foco não está coberta pelo sistema.
9. **Sombra de hover do botão**: o sweep e o glow de hover dependem de hover/pseudo-classe do Tailwind no HTML; não há `transition` combinando `box-shadow` no botão primary (usa `transition-all duration-300`, o que cobre).
10. **Imagens fictícias**: os assets são fotos stock genéricas (URLs `photo-...`), não arte "donghua"; o fallback aponta para um bucket Supabase com nomeclatura própria (`_1600w.jpg/_1600w.webp`), sugerindo um pipeline de geração de variações de resolução que não existe localmente.