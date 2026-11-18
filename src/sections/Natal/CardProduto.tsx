import { useEffect, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { Contador } from "../../components/Contador";
import { Foto } from "../../components/Foto";
import { OpcoesProduto } from "../../components/OpcoesProduto";
import { alternarOpcao, precoUnitario, validarEscolhas } from "../../lib/carrinho";
import { formatarReais } from "../../lib/moeda";
import { usePedido } from "../../state/PedidoContext";
import type { Escolhas, Produto } from "../../types/carrinho";

interface CardProdutoProps {
  produto: Produto;
  /** Guirlandas: foto redonda. Taças: foto em arco. */
  formato: "redonda" | "arco";
}

const FOTO = {
  redonda: "aspect-square w-full max-w-60 rounded-full",
  arco: "aspect-[3/4] w-full max-w-72 rounded-t-full rounded-b-2xl",
};

export function CardProduto({ produto, formato }: CardProdutoProps) {
  const { dispatch, natalAberto } = usePedido();
  const [escolhas, setEscolhas] = useState<Escolhas>({});
  const [quantidade, setQuantidade] = useState(1);
  const [adicionado, setAdicionado] = useState(false);

  useEffect(() => {
    if (!adicionado) return;
    const t = setTimeout(() => setAdicionado(false), 2500);
    return () => clearTimeout(t);
  }, [adicionado]);

  const faltando = Object.keys(validarEscolhas(produto, escolhas));
  const unitario = precoUnitario(produto, escolhas);
  const podeAdicionar = natalAberto && faltando.length === 0;
  const idTitulo = `produto-${produto.id}`;
  const idFalta = `${produto.id}-falta`;

  function alternar(grupoId: string, opcaoId: string) {
    const grupo = produto.grupos.find((g) => g.id === grupoId);
    if (!grupo) return;
    setEscolhas((atual) => ({
      ...atual,
      [grupoId]: alternarOpcao(grupo, atual[grupoId] ?? [], opcaoId),
    }));
  }

  function adicionar() {
    if (!podeAdicionar) return;
    dispatch({ type: "adicionar", produto, escolhas, quantidade });
    setEscolhas({});
    setQuantidade(1);
    setAdicionado(true);
  }

  const gruposFaltando = produto.grupos
    .filter((g) => faltando.includes(g.id))
    .map((g) => g.titulo.toLowerCase());

  return (
    <article
      aria-labelledby={idTitulo}
      className="flex h-full flex-col items-center rounded-3xl border-t-4 border-dourado bg-white px-4 py-6 text-center shadow-[0_6px_22px_rgba(12,69,30,0.10)] sm:px-6"
    >
      <Foto
        src={produto.foto}
        alt={produto.nome}
        sizes="(min-width: 768px) 288px, 75vw"
        className={`${FOTO[formato]} shrink-0 border-2 border-dourado bg-white object-cover p-1`}
      />
      <h3
        id={idTitulo}
        className="mt-4 font-titulo text-3xl leading-tight text-verde sm:text-4xl"
      >
        {produto.nome}
      </h3>
      <p className="mt-2 max-w-md text-tinta/80">{produto.descricao}</p>
      {produto.selo && (
        <p className="mt-3 rounded-full bg-dourado/20 px-4 py-1 text-sm font-bold text-balance text-verde-escuro">
          {produto.selo}
        </p>
      )}

      {produto.grupos.length > 0 && (
        <div className="mt-6 w-full space-y-4">
          {produto.grupos.map((grupo) => (
            <OpcoesProduto
              key={grupo.id}
              prefixo={produto.id}
              grupo={grupo}
              escolhidas={escolhas[grupo.id] ?? []}
              aoAlternar={(opcaoId) => alternar(grupo.id, opcaoId)}
              desativado={!natalAberto}
            />
          ))}
        </div>
      )}

      {/* Rodapé do card: preço, quantidade e botão sempre alinhados embaixo. */}
      <div className="mt-auto w-full pt-6">
        <div className="flex flex-col items-center gap-3">
          <p
            key={unitario}
            className="animate-pulsar rounded-full bg-vinho px-6 py-2 text-lg font-extrabold whitespace-nowrap tabular-nums text-creme"
          >
            {formatarReais(unitario)}
          </p>
          <Contador
            rotulo={produto.nome}
            valor={quantidade}
            minimo={1}
            rotuloMenos={`Diminuir quantidade de ${produto.nome}`}
            rotuloMais={`Aumentar quantidade de ${produto.nome}`}
            aoDiminuir={() => setQuantidade((q) => Math.max(1, q - 1))}
            aoAumentar={() => setQuantidade((q) => q + 1)}
          />
        </div>
        <button
          type="button"
          onClick={adicionar}
          disabled={!podeAdicionar}
          aria-describedby={natalAberto && faltando.length > 0 ? idFalta : undefined}
          className="mt-4 flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-verde px-6 py-2 font-extrabold text-creme shadow-sm transition hover:bg-verde-escuro active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-tinta/20 disabled:text-tinta/60 disabled:shadow-none"
        >
          <ShoppingBag aria-hidden className="size-5 shrink-0" />
          {/* Texto e total em linhas próprias: nada quebra no meio em tela estreita. */}
          <span className="flex flex-col items-start leading-tight">
            <span className="text-lg whitespace-nowrap">
              {natalAberto ? "Adicionar ao pedido" : "Encomendas encerradas"}
            </span>
            {natalAberto && (
              <span className="text-sm whitespace-nowrap tabular-nums opacity-85">
                {" "}
                {formatarReais(unitario * quantidade)}
              </span>
            )}
          </span>
        </button>
        <p aria-live="polite" className="mt-2 min-h-10 text-sm text-balance">
          {adicionado ? (
            <span className="inline-flex items-center gap-1 font-bold text-verde">
              <Check aria-hidden className="size-4" />
              Adicionado ao pedido!
            </span>
          ) : natalAberto && gruposFaltando.length > 0 ? (
            <span id={idFalta} className="text-tinta/70">
              Para adicionar, escolha: {juntar(gruposFaltando)}.
            </span>
          ) : null}
        </p>
      </div>
    </article>
  );
}

/** ["a", "b", "c"] → "a, b e c". */
function juntar(itens: string[]): string {
  if (itens.length <= 1) return itens.join("");
  return `${itens.slice(0, -1).join(", ")} e ${itens.at(-1)}`;
}
