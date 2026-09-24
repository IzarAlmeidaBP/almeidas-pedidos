import { BarraTotal } from "./components/BarraTotal";
import { ResumoPedido } from "./components/ResumoPedido";
import { Dados } from "./sections/Dados";
import { Galeria } from "./sections/Galeria";
import { Hero } from "./sections/Hero";
import { Pagamento } from "./sections/Pagamento";
import { Pedido } from "./sections/Pedido";
import { Rodape } from "./sections/Rodape";
import { usePedido } from "./state/PedidoContext";

export function App() {
  const { estado, totais } = usePedido();

  if (estado.etapa === "pagamento") {
    return (
      <>
        <main>
          <Pagamento />
        </main>
        <Rodape />
      </>
    );
  }

  return (
    <>
      <main>
        <Hero />
        <Galeria />
        {/* Computador (1280px+): pedido à esquerda e resumo fixo à direita. */}
        <div className="mx-auto max-w-site xl:grid xl:grid-cols-[minmax(0,1fr)_21rem] xl:gap-10 xl:px-4">
          <div>
            <Pedido />
            <Dados />
          </div>
          <aside className="hidden xl:block">
            <div className="sticky top-6 py-12">
              <ResumoPedido />
            </div>
          </aside>
        </div>
      </main>
      <Rodape espacoBarra={totais.itens > 0} />
      <BarraTotal />
    </>
  );
}
