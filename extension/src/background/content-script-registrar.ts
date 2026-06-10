import { installNotificationHooks } from '../content/main-world-hook';
import { getStorage } from './storage';

export async function injectMainWorldHook(tabId: number): Promise<void> {
  const storage = await getStorage();
  try {
    await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      world: 'MAIN',
      func: installNotificationHooks,
      args: [storage.whitelist],
    });
  } catch {
    // Tab may not allow injection (chrome://, Web Store, etc.)
  }
}

export async function injectAllTabs(): Promise<void> {
  const tabs = await chrome.tabs.query({});
  await Promise.all(
    tabs.map((tab) => {
      if (tab.id !== undefined) {
        return injectMainWorldHook(tab.id);
      }
      return Promise.resolve();
    }),
  );
}

export async function notifyFocusModeChanged(active: boolean): Promise<void> {
  const tabs = await chrome.tabs.query({});
  await Promise.all(
    tabs.map(async (tab) => {
      if (tab.id === undefined) return;
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'FOCUS_MODE_STATE_CHANGED',
          active,
        });
        if (active) {
          await injectMainWorldHook(tab.id);
        }
      } catch {
        // Tab may not have content script yet
      }
    }),
  );
}
