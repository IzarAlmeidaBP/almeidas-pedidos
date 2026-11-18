import type { ReactNode } from "react";
import { MessageCircle } from "lucide-react";
import { LOJA } from "../../config/loja";
import { TEXTOS_NATAL } from "../../config/natal";
import { usePedido } from "../../state/PedidoContext";
import type { CategoriaProduto } from "../../types/carrinho";
import { CardProduto } from "./CardProduto";
import { ComoEncomendar } from "./ComoEncomendar";

function CabecalhoCategoria({
  id,
  chamada,
  titulo,
  descricao,
}: {
  id: string;
  chamada: string;
  titulo: string;
  descricao?: string;
}) {
  return (
    <header className="mb-6 text-center">
      <p className="text-xs font-bold tracking-[0.25em] text-vinho uppercase">
        {chamada}
      </p>
      <h2
        id={id}
        className="mt-1 font-titulo text-4xl leading-tight text-verde sm:text-5xl"
      >
        {titulo}
      </h2>
      <div aria-hidden className="mx-auto mt-3 h-px w-16 bg-dourado" />
      {descricao && <p className="mx-auto mt-4 max-w-xl text-tinta/80">{descricao}</p>}
    </header>
  );
}

function Categoria({
  ancora,
  categoria,
  chamada,
  children,
}: {
  ancora?: string;
  categoria: Exclude<CategoriaProduto, "morangos">;
  chamada: string;
  children: ReactNode;
}) {
  const textos = TEXTOS_NATAL.categorias[categoria];
  const idTitulo = `titulo-${categoria}`;
  return (
    <section id={ancora} aria-labelledby={idTitulo} className="scroll-mt-20 pt-12">
      <CabecalhoCategoria
        id={idTitulo}
        chamada={chamada}
        titulo={textos.titulo}
        descricao={"descricao" in textos ? textos.descricao : undefined}
      />
      {children}
    </section>
  );
}

/** Catálogo de Natal: guirlandas, mini guirlandas e taças, mais o aviso de encerrado. */
export function CatalogoNatal() {
  const { catalogo, natalAberto } = usePedido();
  const da = (categoria: CategoriaProduto) =>
    catalogo.filter((p) => p.natal && p.categoria === categoria);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-12">
      {!natalAberto && (
        <div
          role="status"
          className="mt-8 rounded-3xl border-2 border-dourado bg-verde px-5 py-6 text-center text-creme"
        >
          <p className="font-titulo text-3xl leading-snug">{TEXTOS_NATAL.encerrado}</p>
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
      )}

      <ComoEncomendar />

      {/* Guirlanda e Mini lado a lado a partir de 768px. */}
      <div id="guirlandas" className="grid scroll-mt-20 gap-x-6 md:grid-cols-2">
        <Categoria categoria="guirlandas" chamada="Monte do seu jeito">
          {da("guirlandas").map((p) => (
            <CardProduto key={p.id} produto={p} formato="redonda" />
          ))}
        </Categoria>
        <Categoria categoria="mini-guirlandas" chamada="Para presentear">
          {da("mini-guirlandas").map((p) => (
            <CardProduto key={p.id} produto={p} formato="redonda" />
          ))}
        </Categoria>
      </div>

      <Categoria ancora="tacas" categoria="tacas" chamada="Nosso cardápio">
        <ul className="grid gap-6 md:grid-cols-2">
          {da("tacas").map((p) => (
            <li
              key={p.id}
              className="md:last:odd:col-span-2 md:last:odd:mx-auto md:last:odd:w-1/2 md:last:odd:px-3"
            >
              <CardProduto produto={p} formato="arco" />
            </li>
          ))}
        </ul>
      </Categoria>
    </div>
  );
}
