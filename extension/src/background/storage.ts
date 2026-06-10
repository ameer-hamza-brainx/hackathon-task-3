import { DEFAULT_SCHEDULE, DEFAULT_STORAGE } from '../shared/defaults';
import type { StorageSchema } from '../shared/types';

export { DEFAULT_STORAGE };

export async function getStorage(): Promise<StorageSchema> {
  const data = await chrome.storage.local.get(DEFAULT_STORAGE);
  return {
    focusModeActive: Boolean(data.focusModeActive),
    permissionSnapshot: data.permissionSnapshot ?? {},
    whitelist: data.whitelist ?? [],
    activeSession: data.activeSession ?? null,
    lastCompletedSession: data.lastCompletedSession ?? null,
    sessionHistory: data.sessionHistory ?? [],
    schedule: data.schedule ?? DEFAULT_SCHEDULE,
    scheduleOverride: data.scheduleOverride ?? null,
  };
}

export async function setStorage(
  partial: Partial<StorageSchema>,
): Promise<StorageSchema> {
  await chrome.storage.local.set(partial);
  return getStorage();
}

export async function initStorage(): Promise<void> {
  const existing = await chrome.storage.local.get(null);
  if (Object.keys(existing).length === 0) {
    await chrome.storage.local.set(DEFAULT_STORAGE);
    return;
  }

  const merged: Partial<StorageSchema> = {};
  if (existing.sessionHistory === undefined) {
    merged.sessionHistory = [];
  }
  if (existing.schedule === undefined) {
    merged.schedule = DEFAULT_SCHEDULE;
  }
  if (existing.scheduleOverride === undefined) {
    merged.scheduleOverride = null;
  }
  if (Object.keys(merged).length > 0) {
    await chrome.storage.local.set(merged);
  }
}
