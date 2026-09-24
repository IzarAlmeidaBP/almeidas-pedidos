# Decisões técnicas

Formato: **data** — decisão. _Motivo._

## Dependências

- **2026-09-24** — `react`, `react-dom`, `vite`, `@vitejs/plugin-react`, `typescript`.
  _Stack definida no pedido inicial._
- **2026-09-24** — `tailwindcss` v4 + `@tailwindcss/vite`. _Stack definida. Na v4 o
  tema fica em CSS (`@theme` em `src/index.css`), não em `tailwind.config.js`; as cores
  da marca estão lá._
- **2026-09-24** — `lucide-react`. _Ícones pedidos na stack. A versão 1.x não tem mais
  ícones de marca, por isso o do Instagram é um SVG próprio (`IconeInstagram.tsx`)._
- **2026-09-24** — `@fontsource/dancing-script` e `@fontsource/nunito`. _Fontes da
  identidade visual servidas pelo próprio site, sem carregar nada do Google Fonts. Assim
  nenhum dado do visitante vai para terceiros (regra de "sem scripts de terceiros") e as
  fontes funcionam offline._
- **2026-09-24** — `vitest`, `jsdom`, `@testing-library/react`,
  `@testing-library/jest-dom`, `@testing-library/user-event`. _Testes unitários e de
  integração pedidos na stack._
- **2026-09-24** — `eslint`, `@eslint/js`, `typescript-eslint`,
  `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`, `prettier`,
  `eslint-config-prettier`. _Lint e formatação pedidos na stack._
- **2026-09-24** — `@types/node`. _Tipos para o `vite.config.ts`._
- **2026-09-24** — `@playwright/test` (1.63.0, só em desenvolvimento). _Pedido explícito:
  testes de ponta a ponta em 360, 390, 768 e 1440px e checagem visual em 320/1920px. O
  390px roda no WebKit (motor do Safari) para ficar mais perto do iPhone._

## Responsividade

- **2026-09-24** — Faixas: celular (<768px) com uma coluna, galeria em carrossel e barra
  fixa de total; tablet (768–1279px) com sabores lado a lado, galeria em 2 colunas e
  barra fixa; computador (1280px+) com conteúdo de até 1100px (`max-w-site`), pedido e
  resumo lado a lado (resumo `sticky`) e galeria em 4 colunas. _Requisito de
  responsividade. O layout lateral começa em 1280px porque em 1024px a coluna do
  formulário ficaria apertada._
- **2026-09-24** — Celular deitado com a variante própria `deitado:` (paisagem com até
  500px de altura): hero em duas colunas e vídeo menor. _Em paisagem o vídeo 9:16
  ocuparia mais que a altura da tela._
- **2026-09-24** — Área segura: `body` com `env(safe-area-inset-top/left/right)`, barra
  fixa com inset de baixo e das laterais, rodapé com inset de baixo. _Notch e barra
  inferior do iPhone, em retrato e em paisagem._
- **2026-09-24** — Abaixo de 360px a foto do card fica menor (80px) e data/horário
  empilham. _Em 320px os botões − / + (48px) não cabiam ao lado da foto de 112px._
- **2026-09-24** — `srcset`/`sizes` com a largura real de cada foto
  (`src/config/imagens.ts`) e `width`/`height` para reservar espaço. Versões menores
  ficam no campo `menores`, sem mexer em componente.
- **2026-09-24** — Versões `-480.webp` de todas as fotos e `-900.webp` só das que
  passam de 900px (`morango-preto`, `morangos-brancos-entrega`), WebP qualidade 78,
  geradas a partir das fotos de `public/img/` (não havia HEIC). _Autorizado pela dona
  do projeto. Gerar do HEIC mudaria o enquadramento (as atuais são recortes); nas fotos
  que já têm 900px, a própria versão atual serve de ~900._
- **2026-09-24** — `tsconfig.test.json` separado: os testes usam tipos do Node
  (`node:fs`) sem que eles fiquem disponíveis no código do site. _Evita usar por engano
  APIs do Node em `src/`._
- **2026-09-24** — Vídeo do topo: o pôster é uma imagem comum que aparece na hora; o
  `<video>` só é criado depois do evento `load` da página e não é criado com
  economia de dados, conexão 2G/3G (`navigator.connection`) ou "reduzir movimento".
  Pausa quando sai da tela. O MP4 já vem com faststart (metadados no início), então
  começa a tocar sem baixar tudo. _Requisito "não travar a página em 4G fraco"._
- **2026-09-24** — O resumo lateral do computador existe no HTML em todas as telas e é
  escondido por CSS abaixo de 1280px. _Evita o resumo "piscar" ao carregar; os testes
  de integração (jsdom, sem CSS) buscam o botão do formulário pela seção "Seus dados"._

## Arquitetura

- **2026-09-24** — Reducer do pedido é função pura em `src/lib/pedidoReducer.ts`; o
  Context fica em `src/state/PedidoContext.tsx`. _Mantém a lógica testável sem React e
  deixa as telas finas._
- **2026-09-24** — Cálculos em centavos (inteiros) em `src/lib/total.ts`. _Evita erro
  de ponto flutuante (ex.: 0,1 + 0,2)._
- **2026-09-24** — As funções de `src/lib/` recebem a config como parâmetro em vez de
  importar `LOJA` direto. _Permite testar outros preços e taxas sem mexer na config
  real._
- **2026-09-24** — A tela de pagamento substitui a página (etapa `pagamento` no
  reducer), sem rotas. _Site de página única; não precisa de roteador (evita
  dependência)._
- **2026-09-24** — Galeria em `src/config/galeria.ts`, separada de `loja.ts`. _São
  conteúdo editável, mas não dados de negócio da loja._

## Dados da loja

- **2026-09-24** — Chave Pix trocada de CPF para **chave aleatória**
  (`c8f5c461-ed0b-4566-b39c-7215aa9216b6`, tipo "Aleatória"); titular continua
  "Sofia Almeida dos Santos". O botão "Copiar chave Pix" copia a chave exatamente como
  está, com os hífens; a função que tirava pontos e traços (feita para o CPF) foi
  removida. O CPF foi apagado de todos os arquivos do projeto antes do primeiro commit.
  _Motivo: não expor o CPF da titular._

## Regras de negócio interpretadas (confirmar com a dona do projeto)

- **2026-09-24** — Na **retirada**, a mensagem do WhatsApp omite a linha
  `Entrega: R$ ...` (além de endereço e referência). _O modelo só mostra o caso de
  entrega; mostrar "Entrega: R$ 0,00" num pedido de retirada confundiria._
- **2026-09-24** — A linha `Obs:` é omitida quando o campo está vazio. _Observações são
  opcionais._
- **2026-09-24** — Data e horário são **obrigatórios**, e a data não pode ser anterior a
  hoje. _Só "Observações" foi marcado como opcional no pedido, e a loja precisa dessa
  informação para confirmar._
- **2026-09-24** — Formato da data/hora na mensagem: `26/09 às 15h` (hora cheia) e
  `26/09 às 9h30` (com minutos). _Segue o exemplo do modelo._
- **2026-09-24** — Limite de 99 unidades por sabor no seletor. _Proteção contra toque
  repetido acidental; não é regra da loja e pode mudar._
- **2026-09-24** — Botão "Finalizar pedido" desabilitado até tudo estar válido. O erro
  de cada campo aparece embaixo dele depois que o cliente sai do campo, e embaixo do
  botão fica a lista "Para finalizar, falta:". _Com o botão desabilitado o cliente não
  conseguiria descobrir o que falta._

## Mídia

- **2026-09-24** — O site usa as mídias oficiais que chegaram já otimizadas (ver
  `assets-originais/LEIA-ME.md`), sem conversão. Elas substituíram as versões
  convertidas antes. _Pedido da dona do projeto._
- **2026-09-24** — Fotos servidas direto como WebP (sem fallback JPG). _Os arquivos
  entregues são só WebP, e todos os navegadores de celular atuais suportam o formato._
- **2026-09-24** — O logo é o `h1` da página (imagem com `alt` igual ao nome da loja).
  _O logo já traz o nome escrito; repetir o texto ao lado ficaria duplicado._
- **2026-09-24** — Cores do tema iguais às do logo: verde `#0C451E`, verde-escuro
  `#1C3213`, vinho `#A3384A`, rosa-claro `#FFF1F4`. O vinho-escuro (hover) e o rosa de
  destaque foram derivados. _Cores exatas informadas pela dona do projeto._
- **2026-09-24** — Com "reduzir movimento" ativado no celular, o hero mostra a foto em
  vez do vídeo. _Acessibilidade._
