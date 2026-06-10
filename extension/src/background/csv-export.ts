import type { CompletedSession } from '../shared/types';

function escapeCsv(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function sessionsToCsv(sessions: CompletedSession[]): string {
  const headers = [
    'session_id',
    'session_start',
    'session_end',
    'duration_seconds',
    'origin',
    'message',
    'timestamp',
    'type',
  ];

  const rows: string[][] = [headers];

  for (const session of sessions) {
    const base = {
      session_id: session.id,
      session_start: new Date(session.startedAt).toISOString(),
      session_end: new Date(session.endedAt).toISOString(),
      duration_seconds: String(Math.floor(session.durationMs / 1000)),
    };

    if (session.queue.length === 0) {
      rows.push([
        base.session_id,
        base.session_start,
        base.session_end,
        base.duration_seconds,
        '',
        '',
        '',
        '',
      ]);
      continue;
    }

    for (const entry of session.queue) {
      rows.push([
        base.session_id,
        base.session_start,
        base.session_end,
        base.duration_seconds,
        entry.origin,
        entry.message,
        new Date(entry.timestamp).toISOString(),
        entry.type,
      ]);
    }
  }

  return rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
}
