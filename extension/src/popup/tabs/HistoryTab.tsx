import { HISTORY_RETENTION_DAYS } from '../../shared/constants';
import type { StorageSchema } from '../../shared/types';
import { ExportCsvButton } from '../components/ExportCsvButton';
import { HistorySessionCard } from '../components/HistorySessionCard';

type Props = {
  state: StorageSchema;
  highlightSessionId?: string | null;
};

export function HistoryTab({ state, highlightSessionId }: Props) {
  const history = [...state.sessionHistory].sort((a, b) => b.endedAt - a.endedAt);

  return (
    <div className="space-y-3">
      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
        <p className="text-xs text-slate-600">
          Session history is kept for the last {HISTORY_RETENTION_DAYS} days.
        </p>
      </div>

      {history.length > 0 && (
        <div className="flex justify-end">
          <ExportCsvButton
            sessionIds={history.map((s) => s.id)}
            label="Export all"
          />
        </div>
      )}

      {history.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">
          No completed sessions yet. Turn Focus Mode on and off to create your first entry.
        </p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {history.map((session) => (
            <HistorySessionCard
              key={session.id}
              session={session}
              highlighted={session.id === highlightSessionId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
