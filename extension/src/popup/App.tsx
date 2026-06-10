import { useEffect, useState } from 'react';
import { TabNav, type AppTab } from './components/TabNav';
import { useFocusMode } from './hooks/useFocusMode';
import { useStorageState } from './hooks/useStorageState';
import { StatusTab } from './tabs/StatusTab';
import { WhitelistTab } from './tabs/WhitelistTab';
import { HistoryTab } from './tabs/HistoryTab';
import { ScheduleTab } from './tabs/ScheduleTab';

export default function App() {
  const [tab, setTab] = useState<AppTab>('status');
  const [highlightSessionId, setHighlightSessionId] = useState<string | null>(null);
  const { state, loading, setState } = useStorageState();
  const { toggle } = useFocusMode(setState);

  useEffect(() => {
    if (highlightSessionId && tab === 'history') {
      const el = document.getElementById(`session-${highlightSessionId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      const timeout = window.setTimeout(() => setHighlightSessionId(null), 3000);
      return () => window.clearTimeout(timeout);
    }
  }, [highlightSessionId, tab]);

  function handleViewHistory(sessionId: string) {
    setHighlightSessionId(sessionId);
    setTab('history');
  }

  if (loading) {
    return (
      <div className="p-4 text-center text-sm text-slate-500">Loading…</div>
    );
  }

  return (
    <div className="bg-white">
      <header className="px-4 pt-4 pb-2">
        <h1 className="text-base font-bold text-slate-800">Focus Mode</h1>
        <p className="text-xs text-slate-500">
          {state.focusModeActive ? 'Blocking notifications' : 'Notifications allowed'}
        </p>
      </header>

      <TabNav active={tab} onChange={setTab} />

      <main className="p-4">
        {tab === 'status' && (
          <StatusTab
            state={state}
            setState={setState}
            onToggle={toggle}
            onViewHistory={handleViewHistory}
          />
        )}
        {tab === 'history' && (
          <HistoryTab state={state} highlightSessionId={highlightSessionId} />
        )}
        {tab === 'whitelist' && (
          <WhitelistTab state={state} setState={setState} />
        )}
        {tab === 'schedule' && (
          <ScheduleTab state={state} setState={setState} />
        )}
      </main>
    </div>
  );
}
