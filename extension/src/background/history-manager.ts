import { HISTORY_RETENTION_DAYS } from '../shared/constants';
import type { CompletedSession } from '../shared/types';
import { getStorage, setStorage } from './storage';

function retentionCutoff(): number {
  return Date.now() - HISTORY_RETENTION_DAYS * 24 * 60 * 60 * 1000;
}

export async function appendSession(session: CompletedSession): Promise<void> {
  const storage = await getStorage();
  const sessionHistory = [session, ...storage.sessionHistory];
  await setStorage({ sessionHistory, lastCompletedSession: session });
}

export async function purgeOldSessions(): Promise<number> {
  const storage = await getStorage();
  const cutoff = retentionCutoff();
  const sessionHistory = storage.sessionHistory.filter(
    (s) => s.endedAt >= cutoff,
  );
  const removed = storage.sessionHistory.length - sessionHistory.length;
  if (removed > 0) {
    await setStorage({ sessionHistory });
  }
  return removed;
}

export async function getSessionHistory(): Promise<CompletedSession[]> {
  const storage = await getStorage();
  return [...storage.sessionHistory].sort((a, b) => b.endedAt - a.endedAt);
}

export async function getSessionsForExport(
  sessionIds?: string[],
): Promise<CompletedSession[]> {
  const history = await getSessionHistory();
  if (!sessionIds || sessionIds.length === 0) {
    return history;
  }
  const idSet = new Set(sessionIds);
  return history.filter((s) => idSet.has(s.id));
}
