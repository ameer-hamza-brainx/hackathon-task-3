/** Self-contained function injected into MAIN world — no external imports. */
export function installNotificationHooks(whitelist: string[]): void {
  const FOCUS_MSG = 'FOCUS_MODE_BLOCKED';
  const wl = new Set(whitelist);
  const hookId = '__focusModeHookInstalled__';

  if ((window as unknown as Record<string, boolean>)[hookId]) return;
  (window as unknown as Record<string, boolean>)[hookId] = true;

  function sanitizeOrigin(origin: string): string {
    if (!origin || origin === 'null') return 'blocked';
    return origin;
  }

  function isWhitelisted(): boolean {
    return wl.has(window.location.origin);
  }

  function postBlock(
    eventType: 'notification' | 'permission' | 'push',
    message?: string,
  ): void {
    window.postMessage(
      {
        type: FOCUS_MSG,
        eventType,
        origin: sanitizeOrigin(window.location.origin),
        message,
      },
      '*',
    );
  }

  function formatMsg(title?: string, body?: string): string {
    const t = title?.trim() || '';
    const b = body?.trim() || '';
    if (t && b) return `${t} — ${b}`;
    if (t) return t;
    if (b) return b;
    return '(No content)';
  }

  const OriginalNotification = window.Notification;

  class BlockedNotification extends OriginalNotification {
    constructor(title: string, options?: NotificationOptions) {
      if (!isWhitelisted()) {
        postBlock('notification', formatMsg(title, options?.body));
        super('', { silent: true });
        return;
      }
      super(title, options);
    }

    static get permission(): NotificationPermission {
      return OriginalNotification.permission;
    }

    static requestPermission(
      deprecatedCallback?: NotificationPermissionCallback,
    ): Promise<NotificationPermission> {
      if (isWhitelisted()) {
        return OriginalNotification.requestPermission(deprecatedCallback);
      }
      postBlock('permission');
      const result = Promise.resolve('denied' as NotificationPermission);
      if (deprecatedCallback) {
        result.then(deprecatedCallback);
      }
      return result;
    }
  }

  Object.defineProperty(window, 'Notification', {
    configurable: true,
    writable: true,
    value: BlockedNotification,
  });

  if ('serviceWorker' in navigator) {
    const originalRegister = navigator.serviceWorker.register.bind(
      navigator.serviceWorker,
    );

    navigator.serviceWorker.register = function (
      ...args: Parameters<ServiceWorkerContainer['register']>
    ) {
      const promise = originalRegister(...args);
      promise.then(() => {
        const proto = ServiceWorkerRegistration.prototype;
        const originalShow = proto.showNotification;
        if ((proto as unknown as Record<string, boolean>).__focusPatched) return;
        (proto as unknown as Record<string, boolean>).__focusPatched = true;

        proto.showNotification = function (
          title: string,
          options?: NotificationOptions,
        ) {
          if (isWhitelisted()) {
            return originalShow.call(this, title, options);
          }
          postBlock('notification', formatMsg(title, options?.body));
          return Promise.resolve();
        };
      });
      return promise;
    };
  }
}
