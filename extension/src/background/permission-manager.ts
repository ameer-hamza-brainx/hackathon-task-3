import type { NotificationSetting } from '../shared/types';
import { getStorage, setStorage } from './storage';

function getNotificationSetting(origin: string): Promise<NotificationSetting> {
  return new Promise((resolve) => {
    chrome.contentSettings.notifications.get(
      { primaryUrl: origin },
      (details) => {
        resolve((details?.setting ?? 'ask') as NotificationSetting);
      },
    );
  });
}

function setNotificationSetting(
  origin: string,
  setting: NotificationSetting,
): Promise<void> {
  return new Promise((resolve) => {
    chrome.contentSettings.notifications.set(
      {
        primaryPattern: `${origin}/*`,
        setting,
      },
      () => resolve(),
    );
  });
}

function setGlobalBlock(): Promise<void> {
  return new Promise((resolve) => {
    chrome.contentSettings.notifications.set(
      {
        primaryPattern: '<all_urls>',
        setting: 'block',
      },
      () => resolve(),
    );
  });
}

function clearBlockingRules(): Promise<void> {
  return new Promise((resolve) => {
    chrome.contentSettings.notifications.clear({}, () => resolve());
  });
}

export async function snapshotPermissions(
  origins: string[],
): Promise<Record<string, NotificationSetting>> {
  const snapshot: Record<string, NotificationSetting> = {};
  const uniqueOrigins = [...new Set(origins)];

  for (const origin of uniqueOrigins) {
    try {
      snapshot[origin] = await getNotificationSetting(origin);
    } catch {
      snapshot[origin] = 'ask';
    }
  }

  await setStorage({ permissionSnapshot: snapshot });
  return snapshot;
}

export async function applyBlockingRules(
  whitelist: string[],
): Promise<void> {
  await setGlobalBlock();

  for (const origin of whitelist) {
    await setNotificationSetting(origin, 'allow');
  }
}

export async function restorePermissions(): Promise<void> {
  const storage = await getStorage();
  const snapshot = storage.permissionSnapshot;

  await clearBlockingRules();

  for (const [origin, setting] of Object.entries(snapshot)) {
    try {
      await setNotificationSetting(origin, setting);
    } catch {
      // Origin may be invalid or inaccessible
    }
  }

  await setStorage({ permissionSnapshot: {} });
}

export async function addWhitelistOrigin(origin: string): Promise<void> {
  const storage = await getStorage();
  if (storage.focusModeActive) {
    const snapshot = { ...storage.permissionSnapshot };
    if (!(origin in snapshot)) {
      snapshot[origin] = await getNotificationSetting(origin);
      await setStorage({ permissionSnapshot: snapshot });
    }
    await setNotificationSetting(origin, 'allow');
  }
}

export async function removeWhitelistOrigin(origin: string): Promise<void> {
  const storage = await getStorage();
  if (storage.focusModeActive) {
    const prior = storage.permissionSnapshot[origin];
    if (prior) {
      await setNotificationSetting(origin, prior);
    } else {
      await setNotificationSetting(origin, 'block');
    }
  }
}
