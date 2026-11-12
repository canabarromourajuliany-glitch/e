const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function parseDay(value: string): Date {
  if (DATE_ONLY.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function formatDay(value: string): string {
  return parseDay(value).toLocaleDateString('pt-BR');
}

export function daysFromToday(value: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((parseDay(value).getTime() - today.getTime()) / 86400000);
}
