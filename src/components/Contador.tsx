import { Minus, Plus } from "lucide-react";
import { QUANTIDADE_MAXIMA } from "../lib/pedidoReducer";

interface ContadorProps {
  rotulo: string;
  valor: number;
  aoDiminuir: () => void;
  aoAumentar: () => void;
}

const botao =
  "flex size-12 items-center justify-center rounded-full border-2 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-35";

export function Contador({ rotulo, valor, aoDiminuir, aoAumentar }: ContadorProps) {
  return (
    <div
      className="flex items-center gap-3"
      role="group"
      aria-label={`Quantidade de ${rotulo}`}
    >
      <button
        type="button"
        onClick={aoDiminuir}
        disabled={valor <= 0}
        aria-label={`Remover 1 ${rotulo}`}
        className={`${botao} border-verde/30 bg-white text-verde hover:border-verde`}
      >
        <Minus aria-hidden className="size-5" />
      </button>
      <span
        key={valor}
        aria-live="polite"
        className="w-8 animate-pulsar text-center text-2xl font-extrabold tabular-nums text-verde"
      >
        {valor}
      </span>
      <button
        type="button"
        onClick={aoAumentar}
        disabled={valor >= QUANTIDADE_MAXIMA}
        aria-label={`Adicionar 1 ${rotulo}`}
        className={`${botao} border-verde bg-verde text-creme hover:bg-verde-escuro`}
      >
        <Plus aria-hidden className="size-5" />
      </button>
    </div>
  );
}
