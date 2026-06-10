import type { SessionStats } from '../../shared/types';
import { getDisplayHost } from '../../shared/origin-utils';
import { CollapsibleSection } from './CollapsibleSection';

type Props = {
  stats: SessionStats;
};

export function OriginBreakdown({ stats }: Props) {
  const entries = Object.entries(stats.byOrigin).sort(
    (a, b) => b[1].total - a[1].total,
  );

  if (entries.length === 0) {
    return null;
  }

  const defaultOpen = entries.length <= 3;

  return (
    <CollapsibleSection title="Breakdown by site" defaultOpen={defaultOpen}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="text-slate-500 border-b border-slate-200">
              <th className="py-1 pr-2">Origin</th>
              <th className="py-1 px-1">Notif</th>
              <th className="py-1 px-1">Perm</th>
              <th className="py-1 px-1">Push</th>
              <th className="py-1 pl-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([origin, data]) => (
              <tr key={origin} className="border-b border-slate-100 text-slate-700">
                <td className="py-1 pr-2 max-w-[140px] truncate" title={origin}>
                  {getDisplayHost(origin)}
                </td>
                <td className="py-1 px-1 text-center">{data.notifications}</td>
                <td className="py-1 px-1 text-center">{data.permissions}</td>
                <td className="py-1 px-1 text-center">{data.push}</td>
                <td className="py-1 pl-1 text-center font-medium">{data.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CollapsibleSection>
  );
}
