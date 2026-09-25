# Planejamento

## Visão

**O site faz:** mostra o bombom de morango cravejado gigante (fotos e vídeo), deixa o
cliente montar o pedido por sabor, informar os dados de entrega (taxa por bairro), ver o
total e a chave Pix, e abrir o WhatsApp da loja com o resumo pronto. O cliente anexa o
comprovante lá.

**O site não faz:** não recebe pagamento, não confere comprovante, não guarda pedidos,
não tem login nem painel. Tudo o que o cliente digita fica só na página e na mensagem do
WhatsApp.

## Fase 1 – MVP

- [x] Setup (Vite, React, TS, Tailwind, ESLint, Prettier, Vitest, scripts, .gitignore)
- [x] Tema com as cores e fontes da marca
- [x] Hero (logo, chamada, botão "Fazer meu pedido", vídeo em loop com pôster)
- [x] Logo oficial no hero, favicon e cores exatas do logo
- [x] Galeria com 4 fotos reais
- [x] Monte seu pedido (card por sabor com − / +, barra fixa com itens e total)
- [x] Seus dados (nome, endereço e referência obrigatórios, data/horário, observações);
      só entrega, com taxa sempre somada
- [x] Taxa de entrega por bairro: lista com busca (sem acento/maiúscula), taxa ao lado do
      bairro, "Meu bairro não está na lista" e "Cidades" bloqueiam o pagamento e abrem a
      consulta no WhatsApp; "Bairro" e "Entrega" no resumo e na mensagem
- [x] Validação com erro ao lado do campo e botão desabilitado até ficar válido
- [x] Tela de pagamento (resumo, total, chave Pix aleatória, copiar a chave exata, WhatsApp, voltar)
- [x] Mensagem do WhatsApp no formato combinado
- [x] Testes das funções de `src/lib/` (total, moeda, data, validação, mensagem, reducer, srcset, vídeo)
- [x] Teste de integração do fluxo completo
- [x] Meta tags Open Graph (com `og-image.jpg`)
- [ ] Open Graph com URL absoluta (bloqueado: depende do endereço do deploy)
- [x] Validação visual em 360px e 390px

## Responsividade (320px a 1920px)

- [x] Celular pequeno (320–374px): sem corte, sem rolagem horizontal, − / + com 48×48px
- [x] Celular comum (375–430px): uma coluna, barra de total fixa no rodapé
- [x] Tablet (768–1024px): sabores lado a lado, galeria em 2 colunas
- [x] Computador (1280px+): conteúdo de até 1100px centralizado, pedido e resumo lado a
      lado com resumo sticky, galeria em 4 colunas
- [x] Área segura do iPhone (`env(safe-area-inset-*)`) na barra fixa, no rodapé e nas
      laterais
- [x] Campos com 16px, `inputmode`, `autocomplete` e `enterkeyhint` em cada campo
- [x] Imagens com `srcset`/`sizes`, `width`/`height` e `loading="lazy"` fora do topo
- [x] Versões menores das fotos para o `srcset` (`-480.webp` e, nas fotos com mais de
      900px, `-900.webp`); no celular o card baixa a de 480px
- [x] Vídeo só carrega depois da página; não carrega com economia de dados, 2G/3G ou
      "reduzir movimento"; pausa fora da tela
- [x] Retrato e paisagem (celular deitado)

### O que foi testado (Playwright, `npm run test:e2e`, 46 testes passando)

- **Fluxo completo** (sabores → dados → pagamento → link do WhatsApp com a mensagem
  inteira conferida) e **só entrega** (sem opção de retirada, finalizar bloqueado sem
  endereço e referência, taxa na mensagem), **bairro de R$ 10,00** (busca sem acento,
  total e mensagem) e **bairro fora da lista** (pagamento bloqueado, link de consulta),
  em: 360px (Chromium, toque), 390px
  (WebKit com perfil de iPhone 13), 768px (Chromium, toque) e 1440px (Chromium).
- **Layout em cada uma dessas larguras:** sem rolagem horizontal e nenhum elemento
  passando da borda; − / + com 44×44px ou mais; fonte dos campos ≥ 16px; atributos
  `inputmode`/`autocomplete`; `srcset`, `sizes` e `lazy` nas fotos; topo sem `lazy`;
  vídeo mudo, em loop e `playsinline`; sabores em uma coluna ou lado a lado conforme a
  largura; colunas da galeria; barra fixa colada no fim da tela mesmo depois de rolar
  (celular/tablet); resumo lateral visível ao rolar, largura ≤ 1100px e centralizado
  (computador).
- **Checagem visual** com capturas revisadas: 320×568 (iPhone SE), 1920×1080,
  844×390 (celular deitado) e 568×320 (iPhone SE deitado), da página inicial ao
  pagamento, sem vazamento.

### O que não foi testado

- **Aparelhos reais** (iPhone, Android): o WebKit do Playwright no Windows não é o
  Safari do iOS. Notch/área segura, zoom ao tocar no campo e a abertura do app do
  WhatsApp só se confirmam num celular de verdade.
- **Firefox**, e larguras de 1024px e 1280px exatas (cobertas só pelas regras de CSS,
  entre os pontos testados).
- **4G fraco de verdade:** a regra do vídeo foi testada por teste unitário
  (`deveCarregarVideo`), mas não houve simulação de rede lenta no navegador. O
  `navigator.connection` não existe no Safari, então no iPhone o vídeo sempre carrega
  (depois da página).
- **Toque real** no carrossel da galeria (arrastar) e o botão "Copiar chave Pix" no
  Playwright (copiar está coberto só no teste de integração).

## Fase 2 – Publicação

- [ ] Deploy de prévia no Netlify ou Vercel (precisa da conta da dona do projeto)
- [ ] Trocar `og:image` para URL absoluta e testar a prévia do link no WhatsApp
- [ ] Testar o fluxo completo num celular real (Android e iPhone)
- [ ] Domínio próprio (se houver)

## Fase 3 – Próximas melhorias

_Backlog a definir com a dona do projeto._

## Fora do escopo por enquanto

- Pagamento automático
- Confirmação de pagamento
- Login
- Painel administrativo
- Envio automático de mensagens

## Pendências / bloqueios

- [ ] Testar o link do WhatsApp (558382025788) em um celular real.
- [ ] Pedir fotos novas do Morango preto (a atual é recorte de story).
- [ ] **Nome do sabor escuro:** o story (IMG_6930) diz "cravejado com chocolate **ao
      leite**", mas a config usa "Morango preto / chocolate preto", como no pedido
      inicial. Confirmar o nome certo antes de publicar (trocar em `src/config/loja.ts`).
- [ ] **Regras interpretadas**, a confirmar (detalhes em `docs/decisoes.md`): "Obs"
      some quando vazio; data e horário são obrigatórios.
- [ ] **Open Graph:** o WhatsApp exige URL absoluta na `og:image`. Atualizar o
      `index.html` quando houver endereço publicado.
- [ ] **Foto `morango-cortado-cesto.jpg`** (a confirmar, segundo o LEIA-ME): confirmar
      se é da loja antes de usar. Obs.: a pasta `assets-originais/a-confirmar/` não está
      no projeto; hoje `assets-originais/` só tem `LEIA-ME.md` e `public/img/`.
- [ ] **Originais HEIC/MOV:** não estão em `assets-originais/` (continuam na pasta
      Downloads). Copiar para lá se quiser guardá-los junto do projeto.
- [ ] **Vídeo:** `morango-banhando.mp4` tem 2 MB (12 s). Se a prévia ficar lenta no
      4G, pedir uma versão mais curta.
- [ ] **Teste em celular real:** iPhone (Safari) em retrato e paisagem, e um Android
      (Chrome).
- [ ] **WebKit do Playwright no Windows instável:** em 1 de 3 execuções completas da
      suíte (2026-09-24), o navegador WebKit caiu no meio (processo saiu com código
      `0xC0000409`) e derrubou os testes do projeto `celular-390-webkit` que estavam
      rodando. Não é falha de asserção; nas outras execuções os 38 testes passaram.
      Investigar à parte (ex.: rodar o WebKit com 1 worker ou `retries: 1` também
      local).

- [ ] **Bairros que podem faltar na lista de entrega:** confirmar com a dona da loja
      bairros como Velame, Glória, Cinza, Louzeiro e Nações (e a taxa de cada um). Até
      lá, quem mora neles escolhe "Meu bairro não está na lista" e consulta no WhatsApp.
      Incluir em `src/config/loja.ts` (`entrega.faixas`).

## Diário de alterações

- **2026-09-24** — Projeto criado: setup completo, tema, todas as seções do MVP, funções
  puras com testes (37 testes passando), fotos e vídeo convertidos, validação visual em
  360/390px, documentação (`AGENTS.md`, `CLAUDE.md`, `docs/`, `README.md`). Deploy
  ainda não feito.
- **2026-09-24** — Troca pelas mídias oficiais já otimizadas (sem conversão): logo no
  topo, favicon, `og-image.jpg`, fotos dos cards e da galeria, vídeo `morango-banhando`.
  Cores do tema ajustadas para as exatas do logo. As imagens geradas antes foram
  removidas. Lint, typecheck, testes (37) e build passando; conferido em 360/390px.
- **2026-09-24** — Responsividade de 320px a 1920px: resumo lateral sticky no
  computador, largura máxima de 1100px, galeria 1/2/4 colunas, área segura do iPhone,
  celular deitado, campos com `inputmode`/`autocomplete`, `srcset`/`sizes`, vídeo
  carregado depois da página. Playwright adicionado (36 testes em 360, 390 WebKit, 768
  e 1440px, mais visual em 320, 1920 e paisagem). Lint, typecheck, Vitest (45), build e
  Playwright passando.
- **2026-09-24** — Versões menores das fotos para o `srcset`, geradas a partir de
  `public/img/` (não havia HEIC em `assets-originais/`); as fotos atuais não foram
  alteradas (hash conferido). No celular, a foto do Morango preto no card caiu de
  240 KB para 26 KB. `tsconfig.test.json` separado para os testes terem tipos do Node.
  Repositório Git criado. Lint, typecheck, Vitest (46), build e Playwright (38, 2
  pulados de propósito) passando.
- **2026-09-24** — Chave Pix trocada de CPF para chave aleatória, copiada com os hífens;
  função que tirava pontos/traços removida; chave quebra linha na tela de pagamento.
  CPF apagado de todos os arquivos (código, testes, docs, `AGENTS.md`, build, relatórios
  do Playwright e objetos do Git ainda não commitados). Lint, typecheck, Vitest (45),
  build e Playwright (38, 2 pulados de propósito) passando; conferido em 320px.
- **2026-09-24** — Só entrega (pedido da dona da loja): opção de retirada removida do
  código, da tela, dos testes e dos docs; taxa fixa de R$ 8,00 sempre somada; endereço
  e referência sempre obrigatórios; aviso "Entrega com taxa fixa de R$ 8,00" no
  formulário. Lint, typecheck, Vitest (43), build e Playwright (38, 2 pulados de
  propósito) passando na última execução; numa execução anterior o WebKit caiu
  (registrado em pendências).
- **2026-09-25** — Taxa de entrega por bairro (substitui a taxa fixa de R$ 8,00): listas
  de R$ 8,00 e R$ 10,00 e "Cidades" (consultar) em `src/config/loja.ts`; seletor com
  busca e taxa ao lado; bairro fora da lista/Cidades bloqueia o pagamento e mostra
  "Consultar entrega no WhatsApp"; "Bairro" e "Entrega" no resumo, no pagamento e na
  mensagem (contrato atualizado a pedido). Testes novos: unitários de `entrega.ts`,
  integração (R$ 8, R$ 10, fora da lista, Cidades, busca com e sem acento) e Playwright
  (R$ 10 e fora da lista). No Playwright, a escolha do bairro desliga a rolagem suave e
  centraliza a opção antes do toque (a barra fixa cobria a opção). Lint, typecheck,
  Vitest (62), build e Playwright (46, 2 pulados de propósito; suíte repetida 3× sem
  falha) passando. Pendente: confirmar bairros que podem faltar.
