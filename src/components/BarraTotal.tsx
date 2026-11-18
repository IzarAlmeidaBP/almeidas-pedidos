import { ShoppingBag } from "lucide-react";
import { formatarReais } from "../lib/moeda";
import { usePedido } from "../state/PedidoContext";

/** Barra fixa no rodapé (celular e tablet): "Ver carrinho (N) · R$ X". */
export function BarraTotal() {
  const { totais } = usePedido();
  if (totais.itens === 0) return null;

  return (
    <div
      role="region"
      aria-label="Resumo do pedido"
      className="fixed inset-x-0 bottom-0 z-40 animate-surgir border-t border-verde-escuro bg-verde text-creme shadow-[0_-6px_20px_rgba(0,0,0,0.15)] xl:hidden"
    >
      {/* Área segura: barra inferior do iPhone embaixo e notch nas laterais (paisagem). */}
      <div className="mx-auto max-w-3xl pt-3 pr-[max(--spacing(4),env(safe-area-inset-right))] pb-[max(--spacing(3),env(safe-area-inset-bottom))] pl-[max(--spacing(4),env(safe-area-inset-left))]">
        <a
          href="#carrinho"
          className="flex min-h-12 items-center justify-between gap-3 rounded-full bg-rosa px-6 font-extrabold text-verde-escuro transition hover:bg-rosa-claro active:scale-[0.98]"
        >
          <span className="flex items-center gap-2">
            <ShoppingBag aria-hidden className="size-5" />
            Ver carrinho ({totais.itens})
          </span>
          <span
            key={totais.total}
            aria-live="polite"
            className="animate-pulsar text-lg tabular-nums"
          >
            {formatarReais(totais.total)}
          </span>
        </a>
      </div>
    </div>
  );
}
