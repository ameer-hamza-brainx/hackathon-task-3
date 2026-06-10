import { DEBOUNCE_MS } from '../shared/constants';
import { notifyFocusModeChanged } from './content-script-registrar';
import { updateIcon } from './icon-manager';
import {
  applyBlockingRules,
  restorePermissions,
  snapshotPermissions,
} from './permission-manager';
import { setScheduleOverride } from './schedule-manager';
import { finalizeSession, resetActiveSession, startSession } from './session-manager';
import { getStorage, setStorage } from './storage';

let lastToggleAt = 0;
let toggleInProgress = false;

export async function enableFocusMode(): Promise<void> {
  const storage = await getStorage();
  const originsToSnapshot = [...storage.whitelist];

  await snapshotPermissions(originsToSnapshot);
  await applyBlockingRules(storage.whitelist);
  await startSession();
  await setStorage({ focusModeActive: true });
  await updateIcon(true);
  await notifyFocusModeChanged(true);
}

export async function disableFocusMode(): Promise<void> {
  await finalizeSession();
  await restorePermissions();
  await setStorage({ focusModeActive: false, activeSession: null });
  await updateIcon(false);
  await notifyFocusModeChanged(false);
}

export async function enableFocusModeBySchedule(): Promise<void> {
  await enableFocusMode();
}

export async function disableFocusModeBySchedule(): Promise<void> {
  await disableFocusMode();
}

async function maybeSetScheduleOverride(): Promise<void> {
  const storage = await getStorage();
  if (storage.schedule.enabled && !storage.schedule.pausedByUser) {
    await setScheduleOverride();
  }
}

export async function toggleFocusMode(): Promise<boolean> {
  const now = Date.now();
  if (toggleInProgress || now - lastToggleAt < DEBOUNCE_MS) {
    const storage = await getStorage();
    return storage.focusModeActive;
  }

  toggleInProgress = true;
  lastToggleAt = now;

  try {
    const storage = await getStorage();
    if (storage.focusModeActive) {
      await disableFocusMode();
      await maybeSetScheduleOverride();
      return false;
    }
    await enableFocusMode();
    await maybeSetScheduleOverride();
    return true;
  } finally {
    toggleInProgress = false;
  }
}

export async function handleBrowserRestart(): Promise<void> {
  const storage = await getStorage();
  if (!storage.focusModeActive) return;

  await resetActiveSession();
  await applyBlockingRules(storage.whitelist);
  await updateIcon(true);
  await notifyFocusModeChanged(true);
}

export async function syncFocusModeOnWake(): Promise<void> {
  const storage = await getStorage();
  await updateIcon(storage.focusModeActive);
  if (storage.focusModeActive) {
    await applyBlockingRules(storage.whitelist);
    await notifyFocusModeChanged(true);
  }
}
