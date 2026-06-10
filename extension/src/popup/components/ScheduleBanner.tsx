import { useEffect, useState } from 'react';
import { MessageType } from '../../shared/messages';
import type { StorageSchema } from '../../shared/types';
import { isWithinSchedule } from '../../shared/schedule-utils';

type Props = {
  state: StorageSchema;
  onDisableSchedule: () => void;
};

export function ScheduleBanner({ state, onDisableSchedule }: Props) {
  const [nextOn, setNextOn] = useState<number | null>(null);

  const show =
    state.schedule.enabled &&
    !state.schedule.pausedByUser &&
    !state.focusModeActive &&
    state.scheduleOverride?.active &&
    isWithinSchedule(new Date(), state.schedule.rules);

  useEffect(() => {
    if (!show) return;
    chrome.runtime
      .sendMessage({ type: MessageType.GET_NEXT_SCHEDULE_ON })
      .then((res) => setNextOn(res?.nextOn ?? null));
  }, [show, state.schedule]);

  if (!show) return null;

  const timeLabel = nextOn
    ? new Date(nextOn).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : 'the next scheduled time';

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 space-y-2">
      <p className="text-sm text-amber-900">
        Schedule will re-enable Focus Mode at {timeLabel}
      </p>
      <button
        type="button"
        onClick={onDisableSchedule}
        className="text-xs font-medium text-amber-800 underline hover:text-amber-950"
      >
        Disable schedule
      </button>
    </div>
  );
}
