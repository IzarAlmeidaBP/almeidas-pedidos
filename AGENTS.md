# Instruções do Projeto — Site Almeida's Confectionery Art

## Sobre o projeto

- Site de pedidos da confeitaria Almeida's – Confectionery Art
  (Campina Grande/PB, Instagram @confectioneryart_). Produto atual:
  bombom de morango cravejado gigante, vendido por unidade.
- Fluxo: cliente monta o pedido → vê o total e a chave Pix → abre o
  WhatsApp da loja com o resumo pronto e anexa o comprovante lá.
- Stack: Vite + React + TypeScript + Tailwind CSS + Vitest. Site estático,
  sem backend e sem banco de dados.
- Planejamento, pendências e diário: `docs/planejamento.md`.
  Decisões técnicas: `docs/decisoes.md`. Ler os dois antes de começar.

## Stack

- Vite + React + TypeScript (strict)
- Tailwind CSS v4 (tema da marca em `src/index.css`, bloco `@theme`)
- lucide-react (ícones); fontes Dancing Script e Nunito via `@fontsource`
- Estado com `useReducer` + Context (`src/state/`), sem biblioteca externa
- ESLint + Prettier; Vitest + Testing Library; Playwright (Chromium e WebKit)
- Deploy estático (Netlify ou Vercel), sem backend

## Comandos

- `npm run dev` — servidor local
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`
- `npm run test` — Vitest
- `npm run test:e2e` — Playwright (compila, sobe o preview e testa 360, 390, 768,
  1440px + checagem visual em 320px, 1920px e celular deitado)
- `npm run build` — build de produção
- `npm run format` — Prettier

## Mapa de pastas

- `src/config/loja.ts` — ÚNICO lugar com dados da loja (preço, taxa de
  entrega, sabores, chave Pix, titular, WhatsApp, Instagram).
- `src/config/galeria.ts` — lista de fotos da galeria.
- `src/config/imagens.ts` — tamanho real de cada foto (srcset e espaço reservado).
- `src/sections/` — seções da página (Hero, Galeria, Pedido, Dados,
  Pagamento, Rodape).
- `src/components/` — componentes visuais reutilizáveis.
- `src/lib/` — funções puras (cálculo do total, formatação em R$,
  montagem da mensagem do WhatsApp, validação, reducer do pedido).
- `src/state/` — Context do pedido (liga o reducer às telas).
- `src/types/` — tipos TypeScript.
- `public/img/` — fotos e vídeo já otimizados.
- `tests/unit` e `tests/integration` — testes (não ficam dentro de `src/`).
- `tests/e2e` — testes Playwright (fluxo, layout por faixa de tela, visual).

## Regras do projeto

- Todo texto visível ao cliente em português do Brasil.
- Mobile-first: o site precisa funcionar de 320px a 1920px. Toda mudança visual deve ser validada nos testes Playwright (360, 390, 768 e 1440px) antes de ser marcada como concluída.
- Nunca fixar preço, taxa, chave Pix, número de WhatsApp ou nome da loja
  dentro de componentes; sempre ler de `src/config/loja.ts`.
- Cálculo de valores e montagem da mensagem do WhatsApp ficam em funções
  puras em `src/lib/`, sempre cobertas por teste unitário.
- O formato da mensagem enviada ao WhatsApp é contrato com a loja: qualquer
  mudança nele precisa de pedido explícito meu e atualização do teste.
- Não adicionar backend, banco de dados, login, pagamento automático ou
  envio automático de mensagens sem pedido explícito meu.
- Não adicionar dependências sem registrar o motivo em `docs/decisoes.md`.
- Imagens entram em `public/img/` já convertidas (WebP/JPG, máx. ~1200px)
  e comprimidas; originais (HEIC/MOV) ficam em `assets-originais/`, fora
  do Git.

## Qualidade e validação

- Após uma alteração, rodar primeiro o teste mais específico da área
  modificada (ex: `npm run test -- mensagem` para filtrar pelo nome do
  arquivo de teste).
- Antes de concluir uma implementação, rodar a suíte aplicável e verificar
  erros do editor (TypeScript e ESLint não podem ficar com erro).
- Para validação completa antes de considerar algo pronto, rodar em
  sequência: `npm run lint`, `npm run typecheck`, `npm run test` e
  `npm run build`.
- Não corrigir problemas que não têm relação com a tarefa pedida; em vez
  disso, registrar esses achados em `docs/planejamento.md`, seção de
  pendências, em vez de misturar no mesmo commit.
- Após cada implementação ou validação, revisar `docs/planejamento.md` e
  marcar como concluído apenas o que foi realmente terminado e verificado.
  Registrar o dia no diário de alterações.
- Não marcar como concluído nada que dependa de algo externo ainda pendente
  (ex: número do WhatsApp confirmado, fotos que ainda não chegaram, domínio,
  novos sabores ou preços). Nesses casos, registrar o bloqueio
  explicitamente em `docs/planejamento.md`, na seção de pendências.

## Modo Conciso

- Ao reportar o que foi feito, retornar apenas o resumo dos pontos
  relevantes.
- Não colar trechos de código nas respostas de resumo, a não ser que eu
  peça explicitamente para ver o código.

## Dados e segurança

- Nunca commitar chaves de API, tokens, senhas ou arquivos `.env`.
- Os dados que o cliente preenche (nome, endereço, ponto de referência,
  observações) só existem na memória da página e na mensagem do WhatsApp.
  Nunca enviar para serviços externos, nunca salvar em localStorage/cookies
  e nunca deixar em `console.log` em código que vai para produção.
- Não adicionar analytics, pixels de rastreamento ou scripts de terceiros
  sem pedido explícito meu.
- Variáveis de ambiente com prefixo `VITE_` nunca podem conter segredos,
  apenas dados já públicos.
- Chave Pix (aleatória), nome da titular e WhatsApp da loja foram autorizados por
  mim para uso público no site. Qualquer outro dado pessoal ou de contato
  (ex: endereço da loja ou da titular) só pode ser publicado se eu confirmar
  explicitamente.

## Git e comunicação

- Preservar alterações existentes e não reverter arquivos sem pedido
  explícito.
- Não criar commits nem branches sem pedido explícito meu.
- Após cada implementação, sempre apresentar uma mensagem de commit
  sugerida (eu decido se aplico).
- Usar Conventional Commits no formato `tipo(escopo): descrição`, em
  português, ex: `feat(pedido): adiciona seletor de quantidade por sabor`.
- Quando a alteração for ampla, incluir um corpo curto no commit com os
  principais pontos alterados e as validações que foram rodadas.
- Antes de sugerir a mensagem de commit, conferir o diff atual
  (`git diff`) para a mensagem descrever só o que de fato mudou.
