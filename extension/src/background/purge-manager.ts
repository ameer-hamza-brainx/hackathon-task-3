import {
  PURGE_ALARM,
  SCHEDULE_CHECK_ALARM,
  SCHEDULE_CHECK_INTERVAL_MIN,
} from '../shared/constants';
import { purgeOldSessions } from './history-manager';
import { evaluateSchedule } from './schedule-manager';

export async function setupAlarms(): Promise<void> {
  await chrome.alarms.create(SCHEDULE_CHECK_ALARM, {
    periodInMinutes: SCHEDULE_CHECK_INTERVAL_MIN,
  });
  await chrome.alarms.create(PURGE_ALARM, {
    periodInMinutes: 24 * 60,
  });
}

export async function runStartupMaintenance(): Promise<void> {
  await purgeOldSessions();
  await evaluateSchedule();
}

export async function handleAlarm(alarmName: string): Promise<void> {
  if (alarmName === PURGE_ALARM) {
    await purgeOldSessions();
    return;
  }
  if (alarmName === SCHEDULE_CHECK_ALARM) {
    await evaluateSchedule();
  }
}
