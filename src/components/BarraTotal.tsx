import { ShoppingBag } from "lucide-react";
import { formatarReais } from "../lib/moeda";
import { usePedido } from "../state/PedidoContext";

export function BarraTotal() {
  const { totais } = usePedido();
  if (totais.itens === 0) return null;

  const rotuloItens = totais.itens === 1 ? "1 morango" : `${totais.itens} morangos`;

  return (
    <div
      role="region"
      aria-label="Resumo do pedido"
      className="fixed inset-x-0 bottom-0 z-40 animate-surgir border-t border-verde-escuro bg-verde text-creme shadow-[0_-6px_20px_rgba(0,0,0,0.15)] xl:hidden"
    >
      {/* Área segura: barra inferior do iPhone embaixo e notch nas laterais (paisagem). */}
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 pt-3 pr-[max(1rem,env(safe-area-inset-right))] pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))]">
        <div className="flex items-center gap-3">
          <ShoppingBag aria-hidden className="size-6 text-rosa" />
          <div aria-live="polite">
            <p className="text-sm leading-tight text-creme/80">{rotuloItens}</p>
            <p
              key={totais.total}
              className="animate-pulsar text-xl font-extrabold leading-tight tabular-nums"
            >
              {formatarReais(totais.total)}
            </p>
          </div>
        </div>
        <a
          href="#dados"
          className="flex min-h-12 items-center rounded-full bg-rosa px-5 font-extrabold text-verde-escuro transition hover:bg-rosa-claro active:scale-95"
        >
          Continuar
        </a>
      </div>
    </div>
  );
}
