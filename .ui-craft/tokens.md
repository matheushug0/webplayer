# Token Spine — FLUI Connect

## Fonte de verdade
- `system-design/design-tokens.json` — contrato extraído de anime-streaming-81.aura.build
- `style.css:18-62` — tokens já implementados em CSS (`:root`)
- Brief: `.ui-craft/brief.md` — princípios decidem a intenção, estes tokens codificam

## Convenção
- base de espaçamento: **4px**
- raios: **4 / 8 / 9999px** (full)
- dark-only (sem variante light)
- nomes são substantivos-do-valor (L1) ou papel-de-uso (L2). Nunca os dois na mesma camada.

---

## L1 — Primitivas (o que o valor É)

### Cor
| Token | Valor | Uso típico |
|---|---|---|
| `--void` | `#050505` | fundo de página |
| `--charcoal` | `#121212` | superfície base |
| `--ink-900` | `#0a0a0a` | superfície mais escura |
| `--ink-800` | `#151515` | elevada |
| `--cinnabar` | `#E60023` | accent escuro (gradientes) |
| `--neon` | `#FF334B` | accent primário |

### Espaço (base 4px)
| Token | Valor |
|---|---|
| `--space-1` | 4px |
| `--space-1\.5` | 6px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |
| `--space-14` | 56px |
| `--space-20` | 80px |
| `--space-24` | 96px |

### Tipo
| Token | Valor |
|---|---|
| `--text-xs` | 0.75rem (12px) |
| `--text-sm` | 0.875rem (14px) |
| `--text-base` | 1rem (16px) |
| `--text-lg` | 1.125rem (18px) |
| `--text-xl` | 1.25rem (20px) |
| `--text-2xl` | 1.5rem (24px) |
| `--text-5xl` | 3rem (48px, hero mobile) |

Pesos: `--weight-light 300` · `--weight-regular 400` · `--weight-medium 500` · `--weight-semibold 600` · `--weight-bold 700` (Cinzel carrega 400/600/800).
Leading: `--leading-none 1` · `--leading-tight 1.25` · `--leading-relaxed 1.625`.
Letter-spacing: `--tracking-tighter -.05em` · `--tracking-tight -.025em` · `--tracking-wide .025em` · `--tracking-wider .05em` · `--tracking-widest .1em`.

### Raio
`--radius-sm 4px` · `--radius-lg 8px` · `--radius-full 9999px` (pills, avatares, marcador de carrossel).

### Motion (DS duration/easing)
| Token | Valor |
|---|---|
| `--duration-fast` | 300ms |
| `--duration-normal` | 500ms |
| `--duration-slow` | 700ms |
| `--ease-default` | `cubic-bezier(.4,0,.2,1)` |
| `--ease-poster` | `cubic-bezier(.25,.46,.45,.94)` |
| `--ease-poster-content` | `cubic-bezier(.16,1,.3,1)` |

### Z-index (semântico)
| Token | Valor | Elemento |
|---|---|---|
| `--z-sticky` | 45 | barra de categorias |
| `--z-navbar` | 50 | navbar |
| `--z-overlay` | 60 | overlay do drawer |
| `--z-drawer` | 70 | drawer |
| `--z-modal` | 80 | modais |
| `--z-toast` | 95 | toasts/notificações |

---

## L2 — Semânticas (o papel do valor na UI)

Implementadas em `style.css:27-53`. Referenciam as primitivas.

### Texto (tintas branco sobre void)
| Token | Valor |
|---|---|
| `--text` | #fff (textPrimary) |
| `--text-90` | rgba(255,255,255,.9) |
| `--text-80` | rgba(255,255,255,.8) |
| `--text-70` | rgba(255,255,255,.7) |
| `--text-2` | rgba(255,255,255,.6) |
| `--text-50` | rgba(255,255,255,.5) |
| `--text-3` | rgba(255,255,255,.4) |
| `--text-4` | rgba(255,255,255,.2) |

### Superfície e borda
| Token | Valor |
|---|---|
| `--surface` | rgba(255,255,255,.05) |
| `--surface2` | rgba(255,255,255,.1) |
| `--surface3` | rgba(255,255,255,.15) |
| `--border` | rgba(255,255,255,.05) |
| `--border2` | rgba(255,255,255,.1) |
| `--border-neon` | rgba(255,51,75,.3) |
| `--glass` | rgba(5,5,5,.72) (void/70) |
| `--glass-border` | rgba(255,255,255,.1) |

### Elevação / brilho (L2; sombras e glow são semânticas — servem a superfícies)
| Token | Valor |
|---|---|
| `--shadow-card` | `0 25px 50px -12px rgb(0 0 0 / .25)` |
| `--shadow-play` | `0 10px 15px -3px rgb(0 0 0 / .1), 0 4px 6px -4px rgb(0 0 0 / .1)` |
| `--neon-glow` | `0 0 10px rgba(255,51,75,.5), 0 0 20px rgba(255,51,75,.2)` |
| `--neon-glow-md` | `0 0 30px rgba(255,51,75,.3)` |
| `--neon-glow-lg` | `0 0 50px rgba(255,51,75,.5)` |

---

## L3 — Componente (sob demanda)
Vanilla CSS monolítico (1116 linhas, sem framework). **Diferir:** criar tokens de componente só quando um componente ganhar múltiplos estados/temas. Hoje as regras consomem L2 diretamente — comportamento correto.

---

## Lacunas identificadas na auditoria (2026-09-19)
1. Espaço, tipo, raio, motion e z-index existem no DS JSON mas **não foram expostos como `--var`** no `:root` — regras usam valores inline (pendente: `/extract`).
2. `--teal`/`--active` mencionados em tokens do DS (`--pad` vs `--space-*`): o CSS usa `--pad` (clamp) e `--navbar-h` como dimensões semânticas de layout — decidi manter (não substituir).
3. `tokens_lint` MCP estava quebrado (schema v0.9.0) — auditoria feita manualmente contra `design-tokens.json`.

## Contrato anti-off-system
Valor off-system = qualquer cor/raio/espaço/motion/z que não saia destes tokens (ou do DS). Regra de checagem: `ui-craft_tokens_lint` quando o MCP voltar a funcionar; até lá, revisão manual.