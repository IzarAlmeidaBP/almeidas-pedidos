import { ShoppingBag } from "lucide-react";
import { LOJA } from "../config/loja";
import { formatarReais } from "../lib/moeda";
import { usePedido } from "../state/PedidoContext";

/** Resumo lateral do computador (fica visível enquanto o cliente rola a página). */
export function ResumoPedido() {
  const { estado, dispatch, totais, entrega, valido } = usePedido();
  const { quantidades } = estado;
  const itens = LOJA.sabores.filter((s) => (quantidades[s.id] ?? 0) > 0);

  return (
    <section
      aria-label="Seu pedido"
      className="rounded-3xl border-2 border-verde/15 bg-white p-6 shadow-sm"
    >
      <h2 className="flex items-center gap-2 text-lg font-extrabold text-verde">
        <ShoppingBag aria-hidden className="size-5 text-vinho" />
        Seu pedido
      </h2>

      {itens.length === 0 ? (
        <p className="mt-4 text-tinta/70">Nenhum morango escolhido ainda.</p>
      ) : (
        <ul className="mt-4 space-y-1.5">
          {itens.map((s) => {
            const qtd = quantidades[s.id] ?? 0;
            return (
              <li key={s.id} className="flex justify-between gap-3">
                <span>
                  {qtd}x {s.nome}
                </span>
                <span className="tabular-nums">
                  {formatarReais(qtd * LOJA.precoUnidade)}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <dl className="mt-4 space-y-1.5 border-t border-creme-escuro pt-4 text-sm text-tinta/80">
        <div className="flex justify-between gap-3">
          <dt>Subtotal</dt>
          <dd className="tabular-nums">{formatarReais(totais.subtotal)}</dd>
        </div>
        {entrega.tipo !== "sem-bairro" && entrega.bairro && (
          <div className="flex justify-between gap-3">
            <dt>Bairro</dt>
            <dd className="text-right">{entrega.bairro}</dd>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <dt>Entrega</dt>
          <dd className="text-right tabular-nums">
            {entrega.tipo === "com-taxa"
              ? formatarReais(totais.taxaEntrega)
              : entrega.tipo === "consultar"
                ? "A consultar"
                : "Escolha o bairro"}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex items-baseline justify-between border-t border-creme-escuro pt-4">
        <span className="font-bold text-verde">Total</span>
        <span
          key={totais.total}
          className="animate-pulsar text-3xl font-extrabold tabular-nums text-verde"
        >
          {formatarReais(totais.total)}
        </span>
      </div>

      {valido ? (
        <button
          type="button"
          onClick={() => dispatch({ type: "irParaPagamento" })}
          className="mt-5 flex min-h-12 w-full items-center justify-center rounded-full bg-vinho px-5 font-extrabold text-creme transition hover:bg-vinho-escuro"
        >
          Finalizar pedido
        </button>
      ) : (
        <a
          href={totais.itens === 0 ? "#pedido" : "#dados"}
          className="mt-5 flex min-h-12 w-full items-center justify-center rounded-full border-2 border-verde px-5 font-extrabold text-verde transition hover:bg-verde/5"
        >
          {totais.itens === 0 ? "Escolher sabores" : "Preencher seus dados"}
        </a>
      )}
    </section>
  );
}
