import { FOCUS_MODE_MESSAGE_TYPE } from '../shared/constants';
import { MessageType, type ContentBlockMessage } from '../shared/messages';
import { installNotificationHooks } from './main-world-hook';

async function getFocusState(): Promise<{
  active: boolean;
  whitelist: string[];
}> {
  const data = await chrome.storage.local.get({
    focusModeActive: false,
    whitelist: [] as string[],
  });
  return {
    active: Boolean(data.focusModeActive),
    whitelist: data.whitelist ?? [],
  };
}

function injectHook(whitelist: string[]): void {
  try {
    const script = document.createElement('script');
    script.textContent = `(${installNotificationHooks.toString()})(${JSON.stringify(whitelist)});`;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
  } catch {
    // Page may block inline script injection
  }
}

async function injectIfActive(): Promise<void> {
  const { active, whitelist } = await getFocusState();
  if (!active) return;
  injectHook(whitelist);
}

function forwardBlockEvent(data: ContentBlockMessage): void {
  if (data.eventType === 'permission') {
    chrome.runtime.sendMessage({
      type: MessageType.PERMISSION_BLOCKED,
      payload: { origin: data.origin },
    });
    return;
  }

  if (data.eventType === 'push') {
    chrome.runtime.sendMessage({
      type: MessageType.PUSH_BLOCKED,
      payload: {
        origin: data.origin,
        message: data.message,
      },
    });
    return;
  }

  chrome.runtime.sendMessage({
    type: MessageType.NOTIFICATION_BLOCKED,
    payload: {
      origin: data.origin,
      message: data.message || '(No content)',
      type: 'notification',
    },
  });
}

window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  const data = event.data as ContentBlockMessage;
  if (data?.type !== FOCUS_MODE_MESSAGE_TYPE) return;
  forwardBlockEvent(data);
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (changes.focusModeActive || changes.whitelist) {
    void injectIfActive();
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === 'FOCUS_MODE_STATE_CHANGED' && message.active) {
    void injectIfActive();
  }
});

void injectIfActive();
