import type { Dispatch, SetStateAction } from 'react';
import { MessageType } from '../../shared/messages';
import type { ScheduleConfig, ScheduleRule, StorageSchema } from '../../shared/types';
import { ScheduleRuleForm } from '../components/ScheduleRuleForm';
import { ScheduleRuleList } from '../components/ScheduleRuleList';

type Props = {
  state: StorageSchema;
  setState: Dispatch<SetStateAction<StorageSchema>>;
};

async function saveSchedule(
  schedule: ScheduleConfig,
  setState: Dispatch<SetStateAction<StorageSchema>>,
): Promise<string | null> {
  const response = await chrome.runtime.sendMessage({
    type: MessageType.SAVE_SCHEDULE,
    payload: { schedule },
  });
  if (response?.state) setState(response.state);
  return response?.error ?? null;
}

export function ScheduleTab({ state, setState }: Props) {
  const { schedule } = state;

  async function updateSchedule(next: ScheduleConfig) {
    const error = await saveSchedule(next, setState);
    if (error) alert(error);
  }

  async function toggleMaster() {
    if (schedule.enabled && !schedule.pausedByUser) {
      await chrome.runtime.sendMessage({ type: MessageType.DISABLE_SCHEDULE });
    } else {
      await chrome.runtime.sendMessage({ type: MessageType.ENABLE_SCHEDULE });
    }
    const fresh = await chrome.runtime.sendMessage({ type: MessageType.GET_STATE });
    if (fresh) setState(fresh);
  }

  function addRule(rule: Omit<ScheduleRule, 'id'>) {
    const newRule: ScheduleRule = { ...rule, id: crypto.randomUUID() };
    updateSchedule({
      ...schedule,
      rules: [...schedule.rules, newRule],
    });
  }

  function removeRule(id: string) {
    updateSchedule({
      ...schedule,
      rules: schedule.rules.filter((r) => r.id !== id),
    });
  }

  const isActive = schedule.enabled && !schedule.pausedByUser;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700">Enable schedule</p>
          <p className="text-xs text-slate-500">Uses your local browser timezone</p>
        </div>
        <button
          type="button"
          onClick={toggleMaster}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            isActive ? 'bg-focus-active' : 'bg-slate-300'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              isActive ? 'translate-x-5' : ''
            }`}
          />
        </button>
      </div>

      {schedule.pausedByUser && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-900">
          Schedule is disabled. Re-enable above to resume automatic Focus Mode.
        </div>
      )}

      <ScheduleRuleList rules={schedule.rules} onRemove={removeRule} />
      <ScheduleRuleForm onAdd={addRule} />
    </div>
  );
}
