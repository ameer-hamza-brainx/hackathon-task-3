import type { QueueEntry } from '../../shared/types';
import { getDisplayHost } from '../../shared/origin-utils';
import { formatTime, truncateText } from '../utils/formatters';
import { CollapsibleSection } from './CollapsibleSection';

type Props = {
  queue: QueueEntry[];
  queueTrimmed: boolean;
};

export function NotificationQueue({ queue, queueTrimmed }: Props) {
  const sorted = [...queue].sort((a, b) => b.timestamp - a.timestamp);
  const count = queue.length;

  return (
    <div className="space-y-1">
      <CollapsibleSection
        title={`View all notifications from Focus mode (${count})`}
        defaultOpen={false}
      >
        {count === 0 ? (
          <p className="text-sm text-slate-500">No notifications were queued this session.</p>
        ) : (
          <ul className="space-y-3 max-h-48 overflow-y-auto">
            {sorted.map((entry) => (
              <li key={entry.id} className="text-sm border-b border-slate-100 pb-2 last:border-0">
                <p className="font-medium text-slate-700">{getDisplayHost(entry.origin)}</p>
                <p className="text-slate-600" title={entry.message}>
                  {truncateText(entry.message)}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{formatTime(entry.timestamp)}</p>
              </li>
            ))}
          </ul>
        )}
        {queueTrimmed && (
          <p className="text-xs text-amber-600 mt-2">
            Showing the most recent 500 — oldest notifications were removed.
          </p>
        )}
      </CollapsibleSection>
      <p className="text-xs text-slate-400 px-1">
        Notification text is stored locally on this device.
      </p>
    </div>
  );
}
