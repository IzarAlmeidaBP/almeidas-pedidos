import { ShoppingBag } from "lucide-react";
import { formatarReais } from "../lib/moeda";
import { usePedido } from "../state/PedidoContext";
import { LinhasPedido } from "./LinhasPedido";

/** Resumo lateral do computador (fica visível enquanto o cliente rola a página). */
export function ResumoPedido() {
  const { dispatch, linhas, totais, entrega, valido, regras } = usePedido();

  return (
    <section
      aria-label="Seu pedido"
      className="rounded-3xl border-2 border-verde/15 bg-white p-6 shadow-sm"
    >
      <h2 className="flex items-center gap-2 text-lg font-extrabold text-verde">
        <ShoppingBag aria-hidden className="size-5 text-vinho" />
        Seu pedido
      </h2>

      {linhas.length === 0 ? (
        <p className="mt-4 text-tinta/70">Nenhum item escolhido ainda.</p>
      ) : (
        <div className="mt-4 max-h-[40vh] overflow-y-auto overscroll-contain pr-1">
          <LinhasPedido linhas={linhas} />
        </div>
      )}

      <dl className="mt-4 space-y-2 border-t border-creme-escuro pt-4 text-sm text-tinta/80">
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
          className="mt-6 flex min-h-12 w-full items-center justify-center rounded-full bg-vinho px-6 font-extrabold text-creme transition hover:bg-vinho-escuro"
        >
          Finalizar pedido
        </button>
      ) : (
        <a
          href={
            totais.itens === 0 ? (regras.ativo ? "#guirlandas" : "#pedido") : "#dados"
          }
          className="mt-6 flex min-h-12 w-full items-center justify-center rounded-full border-2 border-verde px-6 font-extrabold text-verde transition hover:bg-verde/5"
        >
          {totais.itens === 0 ? "Escolher produtos" : "Preencher seus dados"}
        </a>
      )}
    </section>
  );
}
