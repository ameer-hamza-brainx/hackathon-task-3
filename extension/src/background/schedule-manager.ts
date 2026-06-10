import {
  getNextScheduleOnTime,
  isWithinSchedule,
  validateScheduleRules,
} from '../shared/schedule-utils';
import type { ScheduleConfig } from '../shared/types';
import {
  disableFocusModeBySchedule,
  enableFocusModeBySchedule,
} from './focus-mode';
import { getStorage, setStorage } from './storage';

export { isWithinSchedule, getNextScheduleOnTime };

export function validateSchedule(schedule: ScheduleConfig): string | null {
  return validateScheduleRules(schedule.rules, schedule.enabled);
}

export async function setSchedule(schedule: ScheduleConfig): Promise<string | null> {
  const error = validateSchedule(schedule);
  if (error) return error;
  await setStorage({ schedule });
  return null;
}

export async function disableSchedule(): Promise<void> {
  const storage = await getStorage();
  await setStorage({
    schedule: { ...storage.schedule, pausedByUser: true },
    scheduleOverride: null,
  });
}

export async function enableScheduleMaster(): Promise<void> {
  const storage = await getStorage();
  await setStorage({
    schedule: { ...storage.schedule, enabled: true, pausedByUser: false },
  });
}

export async function clearScheduleOverride(): Promise<void> {
  await setStorage({ scheduleOverride: null });
}

export async function setScheduleOverride(): Promise<void> {
  await setStorage({
    scheduleOverride: { active: true, lastToggledAt: Date.now() },
  });
}

export async function evaluateSchedule(): Promise<void> {
  const storage = await getStorage();
  const { schedule } = storage;

  if (!schedule.enabled || schedule.pausedByUser) return;

  await clearScheduleOverride();

  const desired = isWithinSchedule(new Date(), schedule.rules);
  const current = storage.focusModeActive;

  if (desired && !current) {
    await enableFocusModeBySchedule();
  } else if (!desired && current) {
    await disableFocusModeBySchedule();
  }
}

export async function getNextScheduleOnTimestamp(): Promise<number | null> {
  const storage = await getStorage();
  if (!storage.schedule.enabled || storage.schedule.pausedByUser) {
    return null;
  }
  return getNextScheduleOnTime(new Date(), storage.schedule.rules);
}
