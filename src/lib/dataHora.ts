/** "2026-09-26" + "15:00" → "26/09 às 15h"; "15:30" → "26/09 às 15h30". */
export function formatarDataHorario(data: string, horario: string): string {
  const [, mes, dia] = data.split("-");
  const [hora, minuto] = horario.split(":");
  const partes: string[] = [];
  if (dia && mes) partes.push(`${dia}/${mes}`);
  if (hora) {
    const h = String(Number(hora));
    partes.push(minuto && minuto !== "00" ? `${h}h${minuto}` : `${h}h`);
  }
  return partes.join(" às ");
}

/** Data de hoje no fuso local, no formato do input date (AAAA-MM-DD). */
export function hojeISO(agora: Date = new Date()): string {
  const a = agora.getFullYear();
  const m = String(agora.getMonth() + 1).padStart(2, "0");
  const d = String(agora.getDate()).padStart(2, "0");
  return `${a}-${m}-${d}`;
}
