import { Check } from "lucide-react";
import { formatarReais } from "../lib/moeda";
import type { GrupoOpcoes } from "../types/carrinho";

interface OpcoesProdutoProps {
  /** Prefixo único (id do produto) para os nomes dos campos. */
  prefixo: string;
  grupo: GrupoOpcoes;
  escolhidas: readonly string[];
  aoAlternar: (opcaoId: string) => void;
  desativado?: boolean;
}

/** "Escolha 1", "Escolha 2", "Opcional, até 2". */
function instrucaoGrupo(grupo: GrupoOpcoes): string {
  if (grupo.min === 0) return `Opcional, até ${grupo.max}`;
  if (grupo.min === grupo.max) return `Escolha ${grupo.min}`;
  return `Escolha de ${grupo.min} a ${grupo.max}`;
}

/**
 * Escolha única (radio), múltipla com limite (checkbox) ou adicionais com preço.
 * Na múltipla, quando o limite é atingido as outras opções ficam desativadas.
 */
export function OpcoesProduto({
  prefixo,
  grupo,
  escolhidas,
  aoAlternar,
  desativado = false,
}: OpcoesProdutoProps) {
  const unica = grupo.tipo === "unica";
  const cheio = !unica && escolhidas.length >= grupo.max;
  const idInstrucao = `${prefixo}-${grupo.id}-instrucao`;

  return (
    <fieldset className="text-left" aria-describedby={idInstrucao}>
      <legend className="mb-2 flex w-full flex-wrap items-baseline justify-between gap-x-3">
        <span className="font-extrabold text-verde">{grupo.titulo}</span>
        <span id={idInstrucao} className="text-sm text-tinta/70">
          {instrucaoGrupo(grupo)}
          {!unica && grupo.min === grupo.max && ` (${escolhidas.length}/${grupo.max})`}
        </span>
      </legend>
      {/* Chips em 2 colunas iguais: quebram linha de forma organizada. */}
      <div className="grid grid-cols-2 gap-2">
        {grupo.opcoes.map((opcao) => {
          const marcada = escolhidas.includes(opcao.id);
          const bloqueada = desativado || (cheio && !marcada);
          return (
            <label
              key={opcao.id}
              className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 px-3 py-2 text-center text-sm leading-tight font-bold transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-vinho ${
                marcada
                  ? "border-vinho bg-vinho text-creme"
                  : bloqueada
                    ? "cursor-not-allowed border-creme-escuro bg-white text-tinta/40"
                    : "cursor-pointer border-rosa bg-rosa-claro text-vinho hover:border-vinho"
              }`}
            >
              <input
                type={unica ? "radio" : "checkbox"}
                name={`${prefixo}-${grupo.id}`}
                value={opcao.id}
                checked={marcada}
                disabled={bloqueada}
                onChange={() => aoAlternar(opcao.id)}
                className="sr-only"
              />
              {marcada && <Check aria-hidden className="size-4 shrink-0" />}
              <span>
                {opcao.nome}
                {opcao.acrescimo > 0 && " "}
                {opcao.acrescimo > 0 && (
                  <span
                    className={`block font-semibold whitespace-nowrap ${marcada ? "text-creme/85" : "text-tinta/70"}`}
                  >
                    +{formatarReais(opcao.acrescimo)}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
