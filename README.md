# Almeida's – Confectionery Art · site de pedidos

Site estático onde o cliente monta o pedido de bombons de morango, vê o total e a chave
Pix e envia o resumo pronto pelo WhatsApp da loja.

## Rodar no computador

```bash
npm install
npm run dev
```

Abra o endereço que aparecer (normalmente http://localhost:5173).

## Trocar preço, taxa, número ou sabores

Tudo fica em **`src/config/loja.ts`**:

| O que mudar          | Campo                                                      |
| -------------------- | ---------------------------------------------------------- |
| Preço de cada bombom | `precoUnidade: 14.0` (use ponto: `15.5` = R$ 15,50)        |
| Taxa de entrega      | `entrega.faixas` (bairros e taxa) e `entrega.consultar`    |
| WhatsApp da loja     | `whatsapp: "558382025788"` (só números: 55 + DDD + número) |
| Chave Pix / titular  | `pix.chave`, `pix.tipo`, `pix.titular`                     |
| Sabores              | lista `sabores` (id, nome, descrição, foto)                |
| Instagram            | `instagram`                                                |

Para um sabor novo, coloque a foto já otimizada em `public/img/` (WebP ou JPG, máx.
~1200px) e adicione um item em `sabores`.

Depois de mudar, rode `npm run test` (os testes usam a config real e mostram se algo
quebrou) e publique de novo.

## Validar antes de publicar

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e   # Playwright: 360, 390, 768, 1440px + visual 320/1920px
```

Na primeira vez, instale os navegadores do Playwright com
`npx playwright install chromium webkit`. As capturas da checagem visual ficam em
`test-results/` e o relatório em `playwright-report/` (`npx playwright show-report`).

## Publicar

O build gera a pasta `dist/`, que é o site pronto.

**Netlify (mais simples):**

1. Rode `npm run build`.
2. Entre em https://app.netlify.com/drop e arraste a pasta `dist/`.
3. O Netlify mostra o link da prévia.

Ou conecte o repositório no Netlify: o `netlify.toml` já informa o comando
(`npm run build`) e a pasta (`dist`).

**Vercel:** importe o repositório em https://vercel.com/new. O Vite é detectado
sozinho (build `npm run build`, saída `dist`).

Depois de publicar, troque `og:image` no `index.html` pela URL completa (ex.:
`https://seusite.netlify.app/img/og-image.jpg`) para a foto aparecer quando o link for
compartilhado no WhatsApp.
