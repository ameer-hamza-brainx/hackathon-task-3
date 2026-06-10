import { useEffect, useState } from 'react';
import { DEFAULT_SCHEDULE, DEFAULT_STORAGE } from '../../shared/defaults';
import type { StorageSchema } from '../../shared/types';

export function useStorageState() {
  const [state, setState] = useState<StorageSchema>(DEFAULT_STORAGE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chrome.storage.local.get(DEFAULT_STORAGE).then((data) => {
      setState({
        focusModeActive: Boolean(data.focusModeActive),
        permissionSnapshot: data.permissionSnapshot ?? {},
        whitelist: data.whitelist ?? [],
        activeSession: data.activeSession ?? null,
        lastCompletedSession: data.lastCompletedSession ?? null,
        sessionHistory: data.sessionHistory ?? [],
        schedule: data.schedule ?? DEFAULT_SCHEDULE,
        scheduleOverride: data.scheduleOverride ?? null,
      });
      setLoading(false);
    });

    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      area: string,
    ) => {
      if (area !== 'local') return;
      setState((prev) => {
        const next = { ...prev };
        if (changes.focusModeActive) {
          next.focusModeActive = Boolean(changes.focusModeActive.newValue);
        }
        if (changes.whitelist) {
          next.whitelist = (changes.whitelist.newValue as string[]) ?? [];
        }
        if (changes.activeSession) {
          next.activeSession = changes.activeSession.newValue ?? null;
        }
        if (changes.lastCompletedSession) {
          next.lastCompletedSession = changes.lastCompletedSession.newValue ?? null;
        }
        if (changes.sessionHistory) {
          next.sessionHistory = (changes.sessionHistory.newValue as StorageSchema['sessionHistory']) ?? [];
        }
        if (changes.schedule) {
          next.schedule = (changes.schedule.newValue as StorageSchema['schedule']) ?? DEFAULT_SCHEDULE;
        }
        if (changes.scheduleOverride) {
          next.scheduleOverride = changes.scheduleOverride.newValue ?? null;
        }
        if (changes.permissionSnapshot) {
          next.permissionSnapshot = changes.permissionSnapshot.newValue ?? {};
        }
        return next;
      });
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  return { state, loading, setState };
}
