import type { StorageSchema } from './types';

export const DEFAULT_SCHEDULE: StorageSchema['schedule'] = {
  enabled: false,
  rules: [],
  pausedByUser: false,
};

export const DEFAULT_STORAGE: StorageSchema = {
  focusModeActive: false,
  permissionSnapshot: {},
  whitelist: [],
  activeSession: null,
  lastCompletedSession: null,
  sessionHistory: [],
  schedule: DEFAULT_SCHEDULE,
  scheduleOverride: null,
};
