import { handleRuntimeMessage } from './message-handler';
import { toggleFocusMode, handleBrowserRestart, syncFocusModeOnWake } from './focus-mode';
import { initStorage, getStorage } from './storage';
import { updateIcon } from './icon-manager';
import { handleAlarm, runStartupMaintenance, setupAlarms } from './purge-manager';
import type { RuntimeMessage } from '../shared/messages';

chrome.runtime.onInstalled.addListener(async () => {
  await initStorage();
  await setupAlarms();
  await runStartupMaintenance();
  const storage = await getStorage();
  await updateIcon(storage.focusModeActive);
});

chrome.runtime.onStartup.addListener(async () => {
  await handleBrowserRestart();
  await runStartupMaintenance();
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  await handleAlarm(alarm.name);
});

chrome.runtime.onMessage.addListener(
  (message: RuntimeMessage, _sender, sendResponse) => {
    handleRuntimeMessage(message)
      .then(sendResponse)
      .catch((err) => sendResponse({ ok: false, error: String(err) }));
    return true;
  },
);

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-focus-mode') {
    await toggleFocusMode();
    try {
      await chrome.action.openPopup();
    } catch {
      // openPopup may fail outside user gesture context
    }
  }
});

(async () => {
  await initStorage();
  await setupAlarms();
  await syncFocusModeOnWake();
})();
