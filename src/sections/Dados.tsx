import { useState, type FormEvent } from "react";
import { Truck } from "lucide-react";
import { Campo } from "../components/Campo";
import { SeletorBairro } from "../components/SeletorBairro";
import { TituloSecao } from "../components/TituloSecao";
import { hojeISO } from "../lib/dataHora";
import type { CampoValidado } from "../lib/validacao";
import { usePedido } from "../state/PedidoContext";
import type { CampoDados } from "../types/pedido";

/** Ordem em que as pendências aparecem embaixo do botão. */
const ORDEM: CampoValidado[] = [
  "itens",
  "nome",
  "bairro",
  "endereco",
  "referencia",
  "data",
  "horario",
];

export function Dados() {
  const { estado, dispatch, entrega, erros, valido } = usePedido();
  const { dados } = estado;
  const [tocados, setTocados] = useState<Set<CampoDados>>(new Set());

  const tocar = (campo: CampoDados) =>
    setTocados((atual) => (atual.has(campo) ? atual : new Set(atual).add(campo)));

  const atualizar = (campo: CampoDados, valor: string) =>
    dispatch({ type: "atualizarDado", campo, valor });

  const erroVisivel = (campo: CampoDados) =>
    tocados.has(campo) ? erros[campo] : undefined;

  function aoEnviar(evento: FormEvent) {
    evento.preventDefault();
    if (valido) dispatch({ type: "irParaPagamento" });
  }

  const pendencias = ORDEM.map((campo) => erros[campo]).filter(Boolean);

  return (
    <section
      id="dados"
      aria-labelledby="titulo-dados"
      className="scroll-mt-4 bg-white/60 py-12 xl:mb-12 xl:rounded-3xl xl:px-8"
    >
      <form
        noValidate
        onSubmit={aoEnviar}
        className="mx-auto max-w-xl space-y-6 px-4 xl:px-0"
      >
        <TituloSecao id="titulo-dados" titulo="Seus dados" />

        <Campo id="nome" rotulo="Nome" obrigatorio erro={erroVisivel("nome")}>
          {(props) => (
            <input
              {...props}
              type="text"
              inputMode="text"
              autoComplete="name"
              autoCapitalize="words"
              enterKeyHint="next"
              value={dados.nome}
              onChange={(e) => atualizar("nome", e.target.value)}
              onBlur={() => tocar("nome")}
              placeholder="Como devemos te chamar?"
            />
          )}
        </Campo>

        <p className="flex items-center gap-3 rounded-2xl bg-rosa-claro px-4 py-3 text-tinta">
          <Truck aria-hidden className="size-6 shrink-0 text-verde" />
          <span>
            <strong className="text-verde">Entrega</strong> com taxa conforme o bairro.
          </span>
        </p>

        <SeletorBairro
          bairro={dados.bairro}
          bairroOutro={dados.bairroOutro}
          entrega={entrega}
          erro={erroVisivel("bairro")}
          aoEscolher={(bairro) => {
            atualizar("bairro", bairro);
            tocar("bairro");
          }}
          aoDigitarOutro={(nome) => atualizar("bairroOutro", nome)}
          aoSair={() => tocar("bairro")}
        />

        <Campo
          id="endereco"
          rotulo="Endereço completo"
          obrigatorio
          erro={erroVisivel("endereco")}
          dica="Rua, número e complemento."
        >
          {(props) => (
            <textarea
              {...props}
              rows={2}
              inputMode="text"
              autoComplete="street-address"
              autoCapitalize="sentences"
              value={dados.endereco}
              onChange={(e) => atualizar("endereco", e.target.value)}
              onBlur={() => tocar("endereco")}
            />
          )}
        </Campo>
        <Campo
          id="referencia"
          rotulo="Ponto de referência"
          obrigatorio
          erro={erroVisivel("referencia")}
        >
          {(props) => (
            <input
              {...props}
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="sentences"
              enterKeyHint="next"
              value={dados.referencia}
              onChange={(e) => atualizar("referencia", e.target.value)}
              onBlur={() => tocar("referencia")}
              placeholder="Ex.: perto da padaria"
            />
          )}
        </Campo>

        <div>
          <div className="grid gap-3 min-[360px]:grid-cols-2">
            <Campo id="data" rotulo="Data" obrigatorio erro={erroVisivel("data")}>
              {(props) => (
                <input
                  {...props}
                  type="date"
                  autoComplete="off"
                  min={hojeISO()}
                  value={dados.data}
                  onChange={(e) => atualizar("data", e.target.value)}
                  onBlur={() => tocar("data")}
                />
              )}
            </Campo>
            <Campo
              id="horario"
              rotulo="Horário"
              obrigatorio
              erro={erroVisivel("horario")}
            >
              {(props) => (
                <input
                  {...props}
                  type="time"
                  autoComplete="off"
                  value={dados.horario}
                  onChange={(e) => atualizar("horario", e.target.value)}
                  onBlur={() => tocar("horario")}
                />
              )}
            </Campo>
          </div>
          <p className="mt-2 text-sm text-tinta/65">
            A loja confirma a disponibilidade da data e do horário pelo WhatsApp.
          </p>
        </div>

        <Campo id="observacoes" rotulo="Observações">
          {(props) => (
            <textarea
              {...props}
              rows={3}
              inputMode="text"
              autoComplete="off"
              autoCapitalize="sentences"
              enterKeyHint="done"
              value={dados.observacoes}
              onChange={(e) => atualizar("observacoes", e.target.value)}
              placeholder="Ex.: é presente"
            />
          )}
        </Campo>

        <div className="pt-2">
          <button
            type="submit"
            disabled={!valido}
            className="flex min-h-14 w-full items-center justify-center rounded-full bg-vinho px-6 text-lg font-extrabold text-creme shadow-md transition hover:bg-vinho-escuro active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-tinta/25 disabled:text-tinta/60 disabled:shadow-none"
          >
            Finalizar pedido
          </button>
          {pendencias.length > 0 && (
            <div
              className="mt-3 rounded-2xl bg-creme-escuro/60 px-4 py-3 text-sm"
              aria-live="polite"
            >
              <p className="font-bold text-verde">Para finalizar, falta:</p>
              <ul className="mt-1 list-inside list-disc text-tinta/80">
                {pendencias.map((texto) => (
                  <li key={texto}>{texto}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </form>
    </section>
  );
}
