import { Trash2 } from "lucide-react";
import { Contador } from "../components/Contador";
import { TituloSecao } from "../components/TituloSecao";
import { semQuebraNoPreco, textosOpcoes } from "../lib/carrinho";
import { formatarReais } from "../lib/moeda";
import { usePedido } from "../state/PedidoContext";

/** Carrinho com vários itens: cada combinação de opções é uma linha. */
export function Carrinho() {
  const { linhas, totais, dispatch, regras } = usePedido();

  return (
    <section id="carrinho" aria-labelledby="titulo-carrinho" className="secao">
      <div>
        <TituloSecao id="titulo-carrinho" titulo="Seu carrinho" />

        {linhas.length === 0 ? (
          <p className="rounded-3xl bg-white px-6 py-6 text-center text-tinta/75 shadow-sm">
            Seu carrinho está vazio.{" "}
            <a
              href={regras.ativo ? "#guirlandas" : "#pedido"}
              className="font-bold text-vinho underline underline-offset-4"
            >
              Escolher produtos
            </a>
          </p>
        ) : (
          <div className="rounded-3xl bg-white p-4 shadow-sm sm:p-6">
            <ul aria-label="Itens do carrinho" className="divide-y divide-creme-escuro">
              {linhas.map((linha) => {
                const { item, produto } = linha;
                const opcoes = textosOpcoes(linha).map(semQuebraNoPreco);
                const descricao = [produto.nome, ...opcoes].join(", ");
                return (
                  <li key={item.chave} className="py-4 first:pt-1 last:pb-1">
                    <div className="flex justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-extrabold text-verde">{produto.nome}</p>
                        {opcoes.map((t) => (
                          <p key={t} className="text-sm text-tinta/70">
                            {t}
                          </p>
                        ))}
                        <p className="text-sm text-tinta/60">
                          {formatarReais(linha.precoUnitario)} cada
                        </p>
                      </div>
                      <p className="shrink-0 font-extrabold tabular-nums text-verde">
                        {formatarReais(linha.subtotal)}
                      </p>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <Contador
                        compacto
                        rotulo={produto.nome}
                        valor={item.quantidade}
                        minimo={1}
                        rotuloGrupo={`Quantidade no carrinho: ${descricao}`}
                        rotuloMenos={`Diminuir no carrinho: ${descricao}`}
                        rotuloMais={`Aumentar no carrinho: ${descricao}`}
                        aoDiminuir={() =>
                          dispatch({ type: "alterarItem", chave: item.chave, delta: -1 })
                        }
                        aoAumentar={() =>
                          dispatch({ type: "alterarItem", chave: item.chave, delta: 1 })
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          dispatch({ type: "removerItem", chave: item.chave })
                        }
                        aria-label={`Remover do carrinho: ${descricao}`}
                        className="flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-bold text-vinho transition hover:bg-rosa-claro"
                      >
                        <Trash2 aria-hidden className="size-4" />
                        Remover
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 flex items-baseline justify-between border-t border-creme-escuro pt-3">
              <span className="font-bold text-verde">Subtotal</span>
              <span className="text-xl font-extrabold tabular-nums text-verde">
                {formatarReais(totais.subtotal)}
              </span>
            </div>
            <p className="mt-1 text-sm text-tinta/65">
              A taxa de entrega entra quando você escolher o bairro.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
