import { TOP_SITES_COUNT } from '../../shared/constants';
import type { SessionStats } from '../../shared/types';
import { getDisplayHost } from '../../shared/origin-utils';

type Props = {
  stats: SessionStats;
};

export function TopSites({ stats }: Props) {
  const entries = Object.entries(stats.byOrigin)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, TOP_SITES_COUNT);

  if (entries.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-700">Top sites this session</h3>
      <ul className="space-y-1">
        {entries.map(([origin, data], index) => (
          <li
            key={origin}
            className="flex justify-between text-sm text-slate-600 bg-slate-50 rounded px-2 py-1"
          >
            <span>
              {index + 1}. {getDisplayHost(origin)}
            </span>
            <span className="font-medium">{data.total}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
