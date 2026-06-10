import type { CompletedSession } from '../../shared/types';
import { formatDuration, formatSessionWindow } from '../utils/formatters';
import { HeroSummary } from './HeroSummary';
import { StatsChips } from './StatsChips';
import { TopSites } from './TopSites';
import { OriginBreakdown } from './OriginBreakdown';
import { NotificationQueue } from './NotificationQueue';
import { PermissionActivity } from './PermissionActivity';
import { ExportCsvButton } from './ExportCsvButton';

type Props = {
  session: CompletedSession;
  onFocusAgain: () => void;
  onViewHistory?: () => void;
  showFooterActions?: boolean;
};

export function SessionReport({
  session,
  onFocusAgain,
  onViewHistory,
  showFooterActions = true,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-800">Focus Mode ended</h2>
        <HeroSummary session={session} />
        <p className="text-xs text-slate-500">
          {formatSessionWindow(session.startedAt, session.endedAt)}
        </p>
        <p className="text-xs text-slate-500">
          Duration: {formatDuration(session.durationMs)}
        </p>
      </div>

      <StatsChips stats={session.stats} />

      <TopSites stats={session.stats} />

      <OriginBreakdown stats={session.stats} />

      <NotificationQueue
        queue={session.queue}
        queueTrimmed={session.queueTrimmed}
      />

      <PermissionActivity stats={session.stats} />

      {session.stats.total === 0 && session.queue.length === 0 && (
        <p className="text-sm text-center text-slate-500">0 notifications blocked</p>
      )}

      {showFooterActions && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={onFocusAgain}
            className="w-full py-2.5 rounded-xl font-semibold text-white bg-focus-active hover:bg-indigo-600 transition-colors"
          >
            Turn Focus Mode on again
          </button>
          <div className="flex justify-between items-center gap-2">
            <ExportCsvButton sessionIds={[session.id]} />
            {onViewHistory && (
              <button
                type="button"
                onClick={onViewHistory}
                className="text-sm font-medium text-slate-600 hover:text-slate-800"
              >
                View in History
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
