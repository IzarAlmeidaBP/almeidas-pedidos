import { CircleAlert, X } from "lucide-react";
import { usePedido } from "../state/PedidoContext";

/** Aviso fixo no topo (ex.: itens de Natal removidos, data que deixou de valer). */
export function AvisoPedido() {
  const { estado, dispatch } = usePedido();
  return (
    <div
      role="alert"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-[max(0.75rem,env(safe-area-inset-top))]"
    >
      {estado.aviso && (
        <div className="pointer-events-auto flex w-full max-w-md animate-surgir items-start gap-3 rounded-2xl border-2 border-vinho bg-white p-4 text-tinta shadow-xl">
          <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-vinho" />
          <p className="flex-1 font-semibold">{estado.aviso}</p>
          <button
            type="button"
            onClick={() => dispatch({ type: "fecharAviso" })}
            aria-label="Fechar aviso"
            className="-m-2 flex size-11 shrink-0 items-center justify-center rounded-full text-tinta/70 hover:bg-rosa-claro"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>
      )}
    </div>
  );
}
