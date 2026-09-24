import { Contador } from "../components/Contador";
import { Foto } from "../components/Foto";
import { TituloSecao } from "../components/TituloSecao";
import { LOJA } from "../config/loja";
import { formatarReais } from "../lib/moeda";
import { usePedido } from "../state/PedidoContext";

export function Pedido() {
  const { estado, dispatch } = usePedido();

  return (
    <section id="pedido" aria-labelledby="titulo-pedido" className="scroll-mt-4 py-12">
      <div className="mx-auto max-w-3xl px-4 xl:max-w-none xl:px-0">
        <TituloSecao
          id="titulo-pedido"
          titulo="Monte seu pedido"
          subtitulo={`Cada bombom sai por ${formatarReais(LOJA.precoUnidade)}. Pode misturar os sabores!`}
        />
        <ul className="grid gap-4 md:grid-cols-2">
          {LOJA.sabores.map((sabor) => {
            const qtd = estado.quantidades[sabor.id] ?? 0;
            return (
              <li
                key={sabor.id}
                className={`flex gap-3 rounded-3xl border-2 bg-white p-3 shadow-sm transition min-[360px]:gap-4 ${
                  qtd > 0 ? "border-verde" : "border-transparent"
                }`}
              >
                <Foto
                  src={sabor.foto}
                  alt={`Bombom ${sabor.nome.toLowerCase()}`}
                  sizes="(min-width: 360px) 112px, 80px"
                  className="h-28 w-20 shrink-0 rounded-2xl object-cover min-[360px]:h-36 min-[360px]:w-28"
                />
                <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                  <div>
                    <h3 className="text-lg font-extrabold leading-tight text-verde">
                      {sabor.nome}
                    </h3>
                    <p className="mt-0.5 text-sm text-tinta/70">{sabor.descricao}</p>
                    <p className="mt-1 font-bold text-vinho">
                      {formatarReais(LOJA.precoUnidade)}
                    </p>
                  </div>
                  <Contador
                    rotulo={sabor.nome}
                    valor={qtd}
                    aoDiminuir={() =>
                      dispatch({ type: "alterarQuantidade", id: sabor.id, delta: -1 })
                    }
                    aoAumentar={() =>
                      dispatch({ type: "alterarQuantidade", id: sabor.id, delta: 1 })
                    }
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
