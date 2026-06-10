import type { ScheduleRule } from '../../shared/types';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Props = {
  rules: ScheduleRule[];
  onRemove: (id: string) => void;
};

export function ScheduleRuleList({ rules, onRemove }: Props) {
  if (rules.length === 0) {
    return (
      <p className="text-sm text-slate-500 text-center py-4">
        No schedule rules yet.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {rules.map((rule) => (
        <li
          key={rule.id}
          className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
        >
          <div>
            <p className="text-sm text-slate-700">
              {rule.daysOfWeek.map((d) => DAY_LABELS[d]).join(', ')}
            </p>
            <p className="text-xs text-slate-500">
              {rule.startTime} – {rule.endTime}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(rule.id)}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
