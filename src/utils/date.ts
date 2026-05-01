export function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function formatDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function formatMonth(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

export function parseDate(input: string): Date {
  const [y, m, day] = input.split('-').map((x) => Number(x));
  return new Date(y, (m ?? 1) - 1, day ?? 1);
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

export function monthLabel(d: Date): string {
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月`;
}

export type CalendarCell = {
  date: string;
  inMonth: boolean;
  day: number;
};

export function buildMonthGrid(monthStart: Date): CalendarCell[] {
  const start = startOfMonth(monthStart);
  const firstDow = (start.getDay() + 6) % 7;
  const gridStart = addDays(start, -firstDow);
  const cells: CalendarCell[] = [];
  for (let i = 0; i < 42; i += 1) {
    const d = addDays(gridStart, i);
    cells.push({
      date: formatDate(d),
      inMonth: d.getMonth() === start.getMonth(),
      day: d.getDate(),
    });
  }
  return cells;
}

