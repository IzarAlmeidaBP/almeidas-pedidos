import { useState, type FormEvent } from "react";
import { Store, Truck } from "lucide-react";
import { Campo, MensagemErro } from "../components/Campo";
import { TituloSecao } from "../components/TituloSecao";
import { LOJA } from "../config/loja";
import { hojeISO } from "../lib/dataHora";
import { formatarReais } from "../lib/moeda";
import type { CampoValidado } from "../lib/validacao";
import { usePedido } from "../state/PedidoContext";
import type { CampoDados, FormaRecebimento } from "../types/pedido";

const OPCOES: {
  valor: FormaRecebimento;
  titulo: string;
  detalhe: string;
  Icone: typeof Truck;
}[] = [
  {
    valor: "entrega",
    titulo: "Entrega",
    detalhe: `Taxa de ${formatarReais(LOJA.taxaEntrega)}`,
    Icone: Truck,
  },
  { valor: "retirada", titulo: "Retirada", detalhe: "Sem taxa", Icone: Store },
];

/** Ordem em que as pendências aparecem embaixo do botão. */
const ORDEM: CampoValidado[] = [
  "itens",
  "nome",
  "forma",
  "endereco",
  "referencia",
  "data",
  "horario",
];

export function Dados() {
  const { estado, dispatch, erros, valido } = usePedido();
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

        <fieldset aria-describedby={erroVisivel("forma") ? "forma-erro" : undefined}>
          <legend className="mb-1.5 font-bold text-verde">
            Entrega ou retirada?
            <span className="text-vinho" aria-hidden>
              {" "}
              *
            </span>
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {OPCOES.map(({ valor, titulo, detalhe, Icone }) => {
              const marcado = dados.forma === valor;
              return (
                <label
                  key={valor}
                  className={`flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 p-3 text-center transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-vinho ${
                    marcado
                      ? "border-verde bg-verde text-creme"
                      : "border-creme-escuro bg-white text-verde hover:border-verde/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="forma"
                    value={valor}
                    checked={marcado}
                    onChange={() => {
                      atualizar("forma", valor);
                      tocar("forma");
                    }}
                    className="sr-only"
                  />
                  <Icone aria-hidden className="size-6" />
                  <span className="font-extrabold">{titulo}</span>
                  <span
                    className={`text-sm ${marcado ? "text-creme/85" : "text-tinta/70"}`}
                  >
                    {detalhe}
                  </span>
                </label>
              );
            })}
          </div>
          {erroVisivel("forma") && (
            <MensagemErro id="forma-erro">{erroVisivel("forma")}</MensagemErro>
          )}
          {dados.forma === "retirada" && (
            <p className="mt-3 rounded-2xl bg-rosa-claro px-4 py-3 text-sm text-tinta">
              O endereço de retirada é enviado pelo WhatsApp depois que a loja confirmar o
              pagamento.
            </p>
          )}
        </fieldset>

        {dados.forma === "entrega" && (
          <div className="animate-surgir space-y-6">
            <Campo
              id="endereco"
              rotulo="Endereço completo"
              obrigatorio
              erro={erroVisivel("endereco")}
              dica="Rua, número, bairro e complemento."
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
          </div>
        )}

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
