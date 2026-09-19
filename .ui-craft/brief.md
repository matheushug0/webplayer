# Design Brief — FLUI Connect

## 1. Propósito do produto
Player de streaming IPTV para revendedores: o cliente entra com as credenciais fornecidas
pelo revendedor, navega entre canais ao vivo, filmes e séries, e assiste o conteúdo com
o mínimo de atrito possível.

## 2. Usuário primário
Cliente de revendedor de IPTV no Brasil, assistindo em celular, TV ou notebook, geralmente
à noite, em sessões curtas, que espera tocar o conteúdo em segundos, sem ler instruções.

## 3. Princípios (em ordem de resolução de conflito)

1. **"Play beats browse"** — o caminho primário leva ao vídeo tocando; nenhuma tela
   intermediária fica entre o pôster e o play. *Reverte qualquer botão "Assistir" que abra
   modal de informações.*

2. **"O player é o estado, não o destino"** — tocar é instantâneo (1 clique / 1 toque);
   modal, EPG e favoritos são extras que nunca bloqueiam o play. *Bane confirmações e
   telas intermediárias no caminho do vídeo.*

3. **"Modais fiéis ao `/system-design`"** — toda superfície de player/modal usa os tokens
   do design system extraído (Cinzel/neon, raios 4/8/full, tabular-nums), sem invenção
   fora dele. *Bloqueia estilos ad-hoc em player, info e séries.*

4. **"Momentos expressivos, uma vez"** — glow e pulse marcam a primeira olhada e depois
   recuam; nenhuma animação repete para sempre em cada seção. *Raciona o uso do neon
   pulsante e glows por superfície.*

## 4. Métrica de sucesso
Usuário vai de login a um stream tocando em menos de 10 segundos na primeira tentativa,
sem consultar ninguém.

## 5. Fora de escopo
- Sem perfis ou configurações além do login
- Sem recomendações ou personalização
- Sem download / conteúdo offline
- Sem multi-idioma de interface

## 6. Restrições aprendidas (append-only)
- 2026-09-19 — Display: **Cinzel → Geist** (config do usuário). Fontes self-hosted em `fonts/` (`fonts.css` + woff2); CDN removido. Referências a "Cinzel" nas seções 1–5 passam a significar Geist.