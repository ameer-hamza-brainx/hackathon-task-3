import type { SessionStats } from '../../shared/types';
import { getDisplayHost } from '../../shared/origin-utils';
import { CollapsibleSection } from './CollapsibleSection';

type Props = {
  stats: SessionStats;
};

export function PermissionActivity({ stats }: Props) {
  if (stats.permissions === 0) return null;

  const entries = Object.entries(stats.byOrigin)
    .filter(([, data]) => data.permissions > 0)
    .sort((a, b) => b[1].permissions - a[1].permissions);

  const summary = entries
    .slice(0, 2)
    .map(([origin, data]) => `${getDisplayHost(origin)} (${data.permissions})`)
    .join(' · ');

  const content = (
    <div className="space-y-1 text-sm text-slate-600">
      <p>
        {stats.permissions} site{stats.permissions === 1 ? '' : 's'} tried to ask for
        notification permission
      </p>
      {entries.length > 2 ? (
        <CollapsibleSection title="View all permission attempts" defaultOpen={false}>
          <ul className="space-y-1">
            {entries.map(([origin, data]) => (
              <li key={origin} className="flex justify-between">
                <span>{getDisplayHost(origin)}</span>
                <span>{data.permissions}</span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      ) : (
        <p className="text-xs text-slate-500">{summary}</p>
      )}
    </div>
  );

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
      {content}
    </div>
  );
}
