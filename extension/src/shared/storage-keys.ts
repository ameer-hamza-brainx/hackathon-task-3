import type { StorageSchema } from './types';

export const STORAGE_KEYS = {
  focusModeActive: 'focusModeActive',
  permissionSnapshot: 'permissionSnapshot',
  whitelist: 'whitelist',
  activeSession: 'activeSession',
  lastCompletedSession: 'lastCompletedSession',
  sessionHistory: 'sessionHistory',
  schedule: 'schedule',
  scheduleOverride: 'scheduleOverride',
} as const satisfies Record<keyof StorageSchema, string>;
