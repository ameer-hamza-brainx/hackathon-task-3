import { MessageType } from '../../shared/messages';
import type { Dispatch, SetStateAction } from 'react';
import type { StorageSchema } from '../../shared/types';
import { ActiveStatus } from '../components/ActiveStatus';
import { FocusToggle } from '../components/FocusToggle';
import { ScheduleBanner } from '../components/ScheduleBanner';
import { SessionReport } from '../components/SessionReport';
import { useSessionTimer } from '../hooks/useSessionTimer';

type Props = {
  state: StorageSchema;
  setState: Dispatch<SetStateAction<StorageSchema>>;
  onToggle: () => void;
  onViewHistory?: (sessionId: string) => void;
};

export function StatusTab({ state, setState, onToggle, onViewHistory }: Props) {
  const elapsed = useSessionTimer(
    state.activeSession?.startedAt ?? null,
    state.focusModeActive,
  );

  const showReport =
    !state.focusModeActive && state.lastCompletedSession !== null;

  async function handleDisableSchedule() {
    const response = await chrome.runtime.sendMessage({
      type: MessageType.DISABLE_SCHEDULE,
    });
    if (response?.state) setState(response.state);
  }

  return (
    <div className="space-y-4">
      <ScheduleBanner state={state} onDisableSchedule={handleDisableSchedule} />

      {state.focusModeActive && <ActiveStatus elapsedMs={elapsed} />}

      {showReport && state.lastCompletedSession && (
        <SessionReport
          session={state.lastCompletedSession}
          onFocusAgain={onToggle}
          onViewHistory={
            onViewHistory
              ? () => onViewHistory(state.lastCompletedSession!.id)
              : undefined
          }
        />
      )}

      {!state.focusModeActive && !showReport && (
        <div className="text-center py-6 space-y-2">
          <p className="text-slate-600">Focus Mode is off</p>
          <p className="text-xs text-slate-500">
            Turn on to block browser notifications and review what you missed.
          </p>
        </div>
      )}

      <FocusToggle active={state.focusModeActive} onToggle={onToggle} />
    </div>
  );
}
