import { isValid, parse } from 'date-fns';

/** Styling for native `date` / `time` / `month` / `datetime-local` inputs on dark UI */
export const NATIVE_PICKER_CLASS =
  '[color-scheme:dark] min-h-[42px] font-mono text-sm tabular-nums';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

export function toLocalYMD(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Value for `<input type="month" />` (YYYY-MM) */
export function currentMonthInputValue(d = new Date()): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

export function toLocalHM(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** Build tour row `dateLabel` from calendar controls */
export function formatTourDateLabel(dateYYYYMMDD: string, timeHHmm: string): string {
  const [y, mo, d] = dateYYYYMMDD.split('-').map(Number);
  if (!y || !mo || !d) return '';
  const dt = new Date(y, mo - 1, d, 0, 0, 0, 0);
  if (timeHHmm && /^\d{1,2}:\d{2}$/.test(timeHHmm)) {
    const [h, m] = timeHHmm.split(':').map(Number);
    dt.setHours(h || 0, m || 0, 0, 0);
  }
  const dayStr = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  if (!timeHHmm) return dayStr;
  const tStr = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${dayStr} · ${tStr}`;
}

function parseClockLabelToHM(s: string): string {
  const d = new Date(`2000-01-01 ${s.trim()}`);
  if (Number.isNaN(d.getTime())) return '';
  return toLocalHM(d);
}

/** Best-effort parse of existing `dateLabel` into picker values */
export function parseTourCalendarFromLabel(label: string): { date: string; time: string } | null {
  const trimmed = label.trim();
  if (!trimmed) return null;

  const isoHead = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoHead) {
    return { date: isoHead[1], time: '' };
  }

  const dotParts = trimmed.split(/\s*·\s*/);
  if (dotParts.length >= 2) {
    const d0 = Date.parse(dotParts[0]);
    if (!Number.isNaN(d0)) {
      const base = new Date(d0);
      const hm = parseClockLabelToHM(dotParts.slice(1).join(' '));
      if (hm) {
        const [h, m] = hm.split(':').map(Number);
        base.setHours(h, m, 0, 0);
        return { date: toLocalYMD(base), time: hm };
      }
      return { date: toLocalYMD(base), time: '' };
    }
  }

  const asDate = Date.parse(trimmed);
  if (!Number.isNaN(asDate)) {
    const d = new Date(asDate);
    return { date: toLocalYMD(d), time: toLocalHM(d) };
  }

  return null;
}

/** `YYYY-MM` for `<input type="month" />` from stored release label */
export function parseReleaseDateToMonthValue(s: string): string {
  const t = s.trim();
  if (!t) return '';

  const isoMonth = t.match(/^(\d{4}-\d{2})(?:-\d{2})?$/);
  if (isoMonth) return isoMonth[1];

  const yearOnly = t.match(/^(\d{4})$/);
  if (yearOnly) return `${yearOnly[1]}-01`;

  const formats = ['MMM yyyy', 'MMMM yyyy', 'MMM d, yyyy', 'MMMM d, yyyy', 'M/d/yyyy', 'yyyy-MM-dd'];
  for (const fmt of formats) {
    const d = parse(t, fmt, new Date());
    if (isValid(d)) return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
  }

  const guess = new Date(t);
  if (!Number.isNaN(guess.getTime())) return `${guess.getFullYear()}-${pad2(guess.getMonth() + 1)}`;

  return '';
}

export function monthValueToReleaseLabel(monthYYYYMM: string): string {
  const m = monthYYYYMM.match(/^(\d{4})-(\d{2})$/);
  if (!m) return '';
  const y = Number(m[1]);
  const mo = Number(m[2]);
  if (!y || !mo || mo > 12) return '';
  const d = new Date(y, mo - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
