import type { Stage } from './types';

const DAY_MS = 86_400_000;

/** value в формате YYYY-MM-DD — парсим как UTC-полночь, чтобы избежать
 * сдвигов из-за часового пояса браузера. */
export function parseISODate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

export function diffDays(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

export interface TimelineRange {
  start: Date;
  end: Date;
  totalDays: number;
}

/** Диапазон шкалы считается по ВСЕМ этапам объекта (не по отфильтрованным),
 * чтобы шкала не «прыгала» при переключении фильтров. */
export function computeTimelineRange(stages: Stage[]): TimelineRange | null {
  if (stages.length === 0) return null;

  let min = parseISODate(stages[0].startDate);
  let max = parseISODate(stages[0].endDate);
  for (const stage of stages) {
    const start = parseISODate(stage.startDate);
    const end = parseISODate(stage.endDate);
    if (start < min) min = start;
    if (end > max) max = end;
  }

  const start = addDays(min, -2);
  const end = addDays(max, 2);
  return { start, end, totalDays: Math.max(diffDays(start, end), 1) };
}

export function percentForDate(range: TimelineRange, date: Date): number {
  return (diffDays(range.start, date) / range.totalDays) * 100;
}

export interface BarGeometry {
  left: number;
  width: number;
}

export function barGeometry(range: TimelineRange, stage: Stage): BarGeometry {
  const start = parseISODate(stage.startDate);
  const endExclusive = addDays(parseISODate(stage.endDate), 1);
  const left = percentForDate(range, start);
  const width = Math.max(percentForDate(range, endExclusive) - left, 1.5);
  return { left, width };
}

export interface MonthTick {
  label: string;
  percent: number;
}

export function monthTicks(range: TimelineRange): MonthTick[] {
  const ticks: MonthTick[] = [];
  const cursor = new Date(Date.UTC(range.start.getUTCFullYear(), range.start.getUTCMonth(), 1));
  while (cursor.getTime() <= range.end.getTime()) {
    if (cursor.getTime() >= range.start.getTime()) {
      ticks.push({
        label: cursor.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' }),
        percent: percentForDate(range, cursor),
      });
    }
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return ticks;
}

/** Возвращает % позиции «сегодня» на шкале, либо null, если сегодня вне диапазона. */
export function todayPercent(range: TimelineRange): number | null {
  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  if (today.getTime() < range.start.getTime() || today.getTime() > range.end.getTime()) return null;
  return percentForDate(range, today);
}
