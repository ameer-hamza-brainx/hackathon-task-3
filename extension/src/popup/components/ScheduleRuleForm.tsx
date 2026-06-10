import { useState } from 'react';
import type { ScheduleRule } from '../../shared/types';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Props = {
  onAdd: (rule: Omit<ScheduleRule, 'id'>) => void;
};

export function ScheduleRuleForm({ onAdd }: Props) {
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  function toggleDay(day: number) {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onAdd({ daysOfWeek, startTime, endTime });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border border-slate-200 rounded-lg p-3">
      <p className="text-sm font-medium text-slate-700">Add schedule rule</p>

      <div className="flex flex-wrap gap-1">
        {DAY_LABELS.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => toggleDay(index)}
            className={`px-2 py-1 text-xs rounded ${
              daysOfWeek.includes(index)
                ? 'bg-focus-active text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-slate-600">
          Start
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 w-full px-2 py-1 text-sm border border-slate-300 rounded"
          />
        </label>
        <label className="text-xs text-slate-600">
          End
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-1 w-full px-2 py-1 text-sm border border-slate-300 rounded"
          />
        </label>
      </div>

      <button
        type="submit"
        className="w-full py-2 text-sm font-medium text-white bg-focus-active rounded-lg hover:bg-indigo-600"
      >
        Add rule
      </button>
    </form>
  );
}
