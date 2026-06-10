import { normalizeToOrigin } from '../shared/origin-utils';
import { MessageType, type RuntimeMessage } from '../shared/messages';
import { sessionsToCsv } from './csv-export';
import { getSessionsForExport } from './history-manager';
import { toggleFocusMode } from './focus-mode';
import {
  addWhitelistOrigin,
  removeWhitelistOrigin,
} from './permission-manager';
import {
  disableSchedule,
  enableScheduleMaster,
  getNextScheduleOnTimestamp,
  setSchedule,
} from './schedule-manager';
import {
  recordNotificationBlocked,
  recordPermissionBlocked,
  recordPushBlocked,
} from './session-manager';
import { getStorage, setStorage } from './storage';

export async function handleRuntimeMessage(
  message: RuntimeMessage,
): Promise<unknown> {
  switch (message.type) {
    case MessageType.TOGGLE_FOCUS_MODE: {
      const active = await toggleFocusMode();
      return { active, state: await getStorage() };
    }

    case MessageType.GET_STATE:
      return getStorage();

    case MessageType.NOTIFICATION_BLOCKED: {
      const { origin, message: text } = message.payload;
      const parts = text.split(' — ');
      const title = parts[0];
      const body = parts.slice(1).join(' — ');
      await recordNotificationBlocked(origin, title, body || undefined);
      return { ok: true };
    }

    case MessageType.PERMISSION_BLOCKED: {
      await recordPermissionBlocked(message.payload.origin);
      return { ok: true };
    }

    case MessageType.PUSH_BLOCKED: {
      await recordPushBlocked(
        message.payload.origin,
        message.payload.message,
      );
      return { ok: true };
    }

    case MessageType.ADD_WHITELIST: {
      const origin = normalizeToOrigin(message.payload.origin);
      if (!origin) return { ok: false, error: 'Invalid origin' };
      const storage = await getStorage();
      if (storage.whitelist.includes(origin)) {
        return { ok: true, state: storage };
      }
      const whitelist = [...storage.whitelist, origin];
      await setStorage({ whitelist });
      await addWhitelistOrigin(origin);
      return { ok: true, state: await getStorage() };
    }

    case MessageType.REMOVE_WHITELIST: {
      const origin = message.payload.origin;
      const storage = await getStorage();
      const whitelist = storage.whitelist.filter((o) => o !== origin);
      await setStorage({ whitelist });
      await removeWhitelistOrigin(origin);
      return { ok: true, state: await getStorage() };
    }

    case MessageType.SAVE_SCHEDULE: {
      const error = await setSchedule(message.payload.schedule);
      if (error) return { ok: false, error };
      return { ok: true, state: await getStorage() };
    }

    case MessageType.DISABLE_SCHEDULE: {
      await disableSchedule();
      return { ok: true, state: await getStorage() };
    }

    case MessageType.ENABLE_SCHEDULE: {
      await enableScheduleMaster();
      return { ok: true, state: await getStorage() };
    }

    case MessageType.GET_NEXT_SCHEDULE_ON: {
      const nextOn = await getNextScheduleOnTimestamp();
      return { ok: true, nextOn };
    }

    case MessageType.EXPORT_CSV: {
      const sessions = await getSessionsForExport(message.payload?.sessionIds);
      const csv = sessionsToCsv(sessions);
      return { ok: true, csv };
    }

    default:
      return { ok: false };
  }
}
