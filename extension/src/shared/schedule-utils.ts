import type { ScheduleRule } from './types';

function parseTime(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function getNowMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function isRuleActiveAt(rule: ScheduleRule, date: Date): boolean {
  if (!rule.daysOfWeek.includes(date.getDay())) return false;

  const now = getNowMinutes(date);
  const start = parseTime(rule.startTime);
  const end = parseTime(rule.endTime);

  if (start === end) return false;

  if (start < end) {
    return now >= start && now < end;
  }

  return now >= start || now < end;
}

export function isWithinSchedule(
  date: Date,
  rules: ScheduleRule[],
): boolean {
  if (rules.length === 0) return false;
  return rules.some((rule) => isRuleActiveAt(rule, date));
}

function nextOccurrenceForRule(
  rule: ScheduleRule,
  from: Date,
): Date | null {
  const start = parseTime(rule.startTime);

  for (let dayOffset = 0; dayOffset < 8; dayOffset++) {
    const candidate = new Date(from);
    candidate.setDate(candidate.getDate() + dayOffset);
    candidate.setSeconds(0, 0);

    if (!rule.daysOfWeek.includes(candidate.getDay())) continue;

    candidate.setHours(Math.floor(start / 60), start % 60, 0, 0);

    if (candidate.getTime() > from.getTime()) {
      return candidate;
    }
  }

  return null;
}

export function getNextScheduleOnTime(
  from: Date,
  rules: ScheduleRule[],
): number | null {
  const times = rules
    .map((rule) => nextOccurrenceForRule(rule, from))
    .filter((d): d is Date => d !== null)
    .map((d) => d.getTime());

  if (times.length === 0) return null;
  return Math.min(...times);
}

export function validateScheduleRules(
  rules: ScheduleRule[],
  enabled: boolean,
): string | null {
  if (rules.length === 0 && enabled) {
    return 'Add at least one schedule rule';
  }

  for (const rule of rules) {
    if (rule.daysOfWeek.length === 0) {
      return 'Each rule needs at least one day';
    }
    if (!/^\d{2}:\d{2}$/.test(rule.startTime) || !/^\d{2}:\d{2}$/.test(rule.endTime)) {
      return 'Times must be in HH:mm format';
    }
  }

  return null;
}
