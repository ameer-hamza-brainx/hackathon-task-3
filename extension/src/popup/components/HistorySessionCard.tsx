import { useState } from 'react';
import type { CompletedSession } from '../../shared/types';
import { formatDuration, formatTime } from '../utils/formatters';
import { ExportCsvButton } from './ExportCsvButton';
import { HeroSummary } from './HeroSummary';
import { StatsChips } from './StatsChips';
import { TopSites } from './TopSites';
import { OriginBreakdown } from './OriginBreakdown';
import { NotificationQueue } from './NotificationQueue';
import { PermissionActivity } from './PermissionActivity';

type Props = {
  session: CompletedSession;
  highlighted?: boolean;
};

export function HistorySessionCard({ session, highlighted = false }: Props) {
  const [expanded, setExpanded] = useState(false);

  const startStr = formatTime(session.startedAt);
  const endStr = formatTime(session.endedAt);
  const dateStr = new Date(session.startedAt).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      id={`session-${session.id}`}
      className={`border rounded-lg overflow-hidden ${
        highlighted ? 'border-focus-active ring-2 ring-indigo-100' : 'border-slate-200'
      }`}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-slate-100"
      >
        <div className="flex justify-between items-start gap-2">
          <div>
            <p className="text-sm font-medium text-slate-800">
              {dateStr} · {startStr}–{endStr}
            </p>
            <p className="text-xs text-slate-500">
              {formatDuration(session.durationMs)} · {session.stats.total} blocked
            </p>
          </div>
          <span className="text-slate-400 text-xs">{expanded ? '▼' : '▶'}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-3 py-3 space-y-3 border-t border-slate-200">
          <HeroSummary session={session} />
          <StatsChips stats={session.stats} />
          <TopSites stats={session.stats} />
          <OriginBreakdown stats={session.stats} />
          <NotificationQueue
            queue={session.queue}
            queueTrimmed={session.queueTrimmed}
          />
          <PermissionActivity stats={session.stats} />
          <ExportCsvButton sessionIds={[session.id]} className="block" />
        </div>
      )}
    </div>
  );
}
