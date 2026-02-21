// Parsea "YYYY-MM-DD" como fecha local (evita el desfase UTC en zonas != UTC)
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function getDueDateLabel(dueDate: string): string {
  const today = getToday();
  const due = parseLocalDate(dueDate);
  const diff = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `Venció hace ${Math.abs(diff)} día${Math.abs(diff) !== 1 ? "s" : ""}`;
  if (diff === 0) return "Vence hoy";
  if (diff === 1) return "Vence mañana";
  if (diff <= 7) return `Vence en ${diff} días`;
  return `Vence el ${due.toLocaleDateString("es-AR", { day: "numeric", month: "short" })}`;
}

export function isDateOverdue(dueDate: string): boolean {
  return parseLocalDate(dueDate) < getToday();
}

export function getDaysUntilDue(dueDate: string): number {
  const today = getToday();
  const due = parseLocalDate(dueDate);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
