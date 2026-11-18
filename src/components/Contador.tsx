import { Minus, Plus } from "lucide-react";
import { QUANTIDADE_MAXIMA } from "../lib/carrinho";

interface ContadorProps {
  rotulo: string;
  valor: number;
  aoDiminuir: () => void;
  aoAumentar: () => void;
  /** Menor valor (o − fica desativado nele). */
  minimo?: number;
  /** Nomes acessíveis (a mesma página tem contadores do card e do carrinho). */
  rotuloGrupo?: string;
  rotuloMenos?: string;
  rotuloMais?: string;
  /** Botões menores (linha do carrinho), ainda com 44×44px. */
  compacto?: boolean;
}

export function Contador({
  rotulo,
  valor,
  aoDiminuir,
  aoAumentar,
  minimo = 0,
  rotuloGrupo = `Quantidade de ${rotulo}`,
  rotuloMenos = `Remover 1 ${rotulo}`,
  rotuloMais = `Adicionar 1 ${rotulo}`,
  compacto = false,
}: ContadorProps) {
  const botao = `flex ${compacto ? "size-11" : "size-12"} items-center justify-center rounded-full border-2 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-35`;
  return (
    <div
      className={`flex items-center ${compacto ? "gap-2" : "gap-3"}`}
      role="group"
      aria-label={rotuloGrupo}
    >
      <button
        type="button"
        onClick={aoDiminuir}
        disabled={valor <= minimo}
        aria-label={rotuloMenos}
        className={`${botao} border-verde/30 bg-white text-verde hover:border-verde`}
      >
        <Minus aria-hidden className="size-5" />
      </button>
      <span
        key={valor}
        aria-live="polite"
        className={`w-8 animate-pulsar text-center font-extrabold tabular-nums text-verde ${compacto ? "text-xl" : "text-2xl"}`}
      >
        {valor}
      </span>
      <button
        type="button"
        onClick={aoAumentar}
        disabled={valor >= QUANTIDADE_MAXIMA}
        aria-label={rotuloMais}
        className={`${botao} border-verde bg-verde text-creme hover:bg-verde-escuro`}
      >
        <Plus aria-hidden className="size-5" />
      </button>
    </div>
  );
}
