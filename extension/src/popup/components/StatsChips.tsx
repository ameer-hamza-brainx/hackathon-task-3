import type { SessionStats } from '../../shared/types';

type Props = {
  stats: SessionStats;
};

export function StatsChips({ stats }: Props) {
  const chips = [
    { label: 'Total blocked', value: stats.total },
    { label: 'Notifications', value: stats.notifications },
    { label: 'Permission asks', value: stats.permissions },
    { label: 'Push events', value: stats.push },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {chips.map((chip) => (
        <div
          key={chip.label}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-center"
        >
          <p className="text-lg font-bold text-slate-800">{chip.value}</p>
          <p className="text-xs text-slate-500">{chip.label}</p>
        </div>
      ))}
    </div>
  );
}
