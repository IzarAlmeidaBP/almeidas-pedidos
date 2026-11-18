import { MessageCircle } from "lucide-react";
import { TituloSecao } from "../../components/TituloSecao";
import { LOJA } from "../../config/loja";
import { TEXTOS_NATAL } from "../../config/natal";
import { usePedido } from "../../state/PedidoContext";
import type { CategoriaProduto } from "../../types/carrinho";
import { CardProduto } from "./CardProduto";
import { ComoEncomendar } from "./ComoEncomendar";

/** Prende o emoji à palavra anterior (não quebra sozinho para a linha de baixo). */
const semEmojiSozinho = (texto: string) =>
  texto.replace(/ (\p{Extended_Pictographic})/gu, " $1");

/** Catálogo de Natal: guirlandas, mini guirlandas e taças, mais o aviso de encerrado. */
export function CatalogoNatal() {
  const { catalogo, natalAberto } = usePedido();
  const da = (categoria: CategoriaProduto) =>
    catalogo.filter((p) => p.natal && p.categoria === categoria);
  const { categorias } = TEXTOS_NATAL;

  return (
    <>
      {!natalAberto && (
        <div className="conteudo pt-8 md:pt-12">
          <div
            role="status"
            className="rounded-3xl border-2 border-dourado bg-verde px-6 py-8 text-center text-creme"
          >
            <p className="font-titulo text-3xl leading-snug text-balance">
              {semEmojiSozinho(TEXTOS_NATAL.encerrado)}
            </p>
            <a
              href={`https://wa.me/${LOJA.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-creme px-6 font-extrabold text-verde transition hover:bg-rosa-claro"
            >
              <MessageCircle aria-hidden className="size-5" />
              Falar no WhatsApp
            </a>
          </div>
        </div>
      )}

      <ComoEncomendar />

      {/*
        Guirlanda e Mini: 1 coluna no celular e lado a lado a partir de 768px. A subgrade
        alinha os títulos numa linha e os cards na de baixo (mesma altura).
      */}
      <div
        id="guirlandas"
        className="secao conteudo grid gap-x-6 md:grid-cols-2 md:grid-rows-[auto_1fr]"
      >
        <section
          aria-labelledby="titulo-guirlandas"
          className="row-span-2 grid grid-rows-subgrid"
        >
          <TituloSecao
            id="titulo-guirlandas"
            chamada="Monte do seu jeito"
            titulo={categorias.guirlandas.titulo}
            cor="verde"
          />
          {da("guirlandas").map((p) => (
            <CardProduto key={p.id} produto={p} formato="redonda" />
          ))}
        </section>
        <section
          aria-labelledby="titulo-mini-guirlandas"
          className="row-span-2 mt-16 grid grid-rows-subgrid md:mt-0"
        >
          <TituloSecao
            id="titulo-mini-guirlandas"
            chamada="Para presentear"
            titulo={categorias["mini-guirlandas"].titulo}
            cor="verde"
          />
          {da("mini-guirlandas").map((p) => (
            <CardProduto key={p.id} produto={p} formato="redonda" />
          ))}
        </section>
      </div>

      <section id="tacas" aria-labelledby="titulo-tacas" className="secao conteudo">
        <TituloSecao
          id="titulo-tacas"
          chamada="Nosso cardápio"
          titulo={categorias.tacas.titulo}
          subtitulo={categorias.tacas.descricao}
          cor="verde"
        />
        {/*
          1 coluna no celular, 2 no tablet e 3 no computador. Flex com quebra (e não
          grade) para a última linha incompleta ficar centralizada; os itens da mesma
          linha esticam até a mesma altura.
        */}
        <ul className="flex flex-wrap justify-center gap-6">
          {da("tacas").map((p) => (
            <li
              key={p.id}
              className="w-full md:w-[calc((100%-var(--spacing)*6)/2)] xl:w-[calc((100%-var(--spacing)*12)/3)]"
            >
              <CardProduto produto={p} formato="arco" />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
