import { QUEUE_CAP } from '../shared/constants';
import { sanitizeOrigin } from '../shared/origin-utils';
import type {
  ActiveSession,
  BlockEventType,
  CompletedSession,
  QueueEntry,
  SessionStats,
} from '../shared/types';
import { appendSession } from './history-manager';
import { getStorage, setStorage } from './storage';

function createEmptyStats(): SessionStats {
  return {
    notifications: 0,
    permissions: 0,
    push: 0,
    total: 0,
    byOrigin: {},
  };
}

export function createActiveSession(): ActiveSession {
  return {
    startedAt: Date.now(),
    stats: createEmptyStats(),
    queue: [],
    queueTrimmed: false,
  };
}

function ensureOriginStats(stats: SessionStats, origin: string) {
  if (!stats.byOrigin[origin]) {
    stats.byOrigin[origin] = {
      notifications: 0,
      permissions: 0,
      push: 0,
      total: 0,
    };
  }
  return stats.byOrigin[origin];
}

function formatMessage(title?: string, body?: string): string {
  const t = title?.trim() || '';
  const b = body?.trim() || '';
  if (t && b) return `${t} — ${b}`;
  if (t) return t;
  if (b) return b;
  return '(No content)';
}

export async function startSession(): Promise<ActiveSession> {
  const session = createActiveSession();
  await setStorage({ activeSession: session });
  return session;
}

export async function resetActiveSession(): Promise<ActiveSession> {
  return startSession();
}

export async function recordBlockedEvent(
  eventType: BlockEventType,
  origin: string,
  message?: string,
): Promise<void> {
  const storage = await getStorage();
  if (!storage.focusModeActive || !storage.activeSession) return;

  const safeOrigin = sanitizeOrigin(origin);
  const session = structuredClone(storage.activeSession);
  const originStats = ensureOriginStats(session.stats, safeOrigin);

  if (eventType === 'notification') {
    session.stats.notifications += 1;
    originStats.notifications += 1;
  } else if (eventType === 'permission') {
    session.stats.permissions += 1;
    originStats.permissions += 1;
  } else if (eventType === 'push') {
    session.stats.push += 1;
    originStats.push += 1;
  }

  session.stats.total += 1;
  originStats.total += 1;

  if (eventType === 'notification' || eventType === 'push') {
    const entry: QueueEntry = {
      id: crypto.randomUUID(),
      origin: safeOrigin,
      message:
        message ||
        (eventType === 'push' ? 'Push event received' : '(No content)'),
      timestamp: Date.now(),
      type: eventType === 'push' ? 'push' : 'notification',
    };

    session.queue.push(entry);
    if (session.queue.length > QUEUE_CAP) {
      session.queue = session.queue.slice(session.queue.length - QUEUE_CAP);
      session.queueTrimmed = true;
    }
  }

  await setStorage({ activeSession: session });
}

export async function recordNotificationBlocked(
  origin: string,
  title?: string,
  body?: string,
): Promise<void> {
  await recordBlockedEvent(
    'notification',
    origin,
    formatMessage(title, body),
  );
}

export async function recordPermissionBlocked(origin: string): Promise<void> {
  await recordBlockedEvent('permission', origin);
}

export async function recordPushBlocked(
  origin: string,
  message?: string,
): Promise<void> {
  await recordBlockedEvent(
    'push',
    origin,
    message || 'Push event received',
  );
}

export async function finalizeSession(): Promise<CompletedSession | null> {
  const storage = await getStorage();
  if (!storage.activeSession) return null;

  const endedAt = Date.now();
  const completed: CompletedSession = {
    ...structuredClone(storage.activeSession),
    id: crypto.randomUUID(),
    endedAt,
    durationMs: endedAt - storage.activeSession.startedAt,
  };

  await appendSession(completed);
  await setStorage({ activeSession: null });

  return completed;
}
