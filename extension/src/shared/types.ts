export type NotificationSetting = 'allow' | 'block' | 'ask';

export type QueueEntry = {
  id: string;
  origin: string;
  message: string;
  timestamp: number;
  type: 'notification' | 'push';
};

export type OriginStats = {
  notifications: number;
  permissions: number;
  push: number;
  total: number;
};

export type SessionStats = {
  notifications: number;
  permissions: number;
  push: number;
  total: number;
  byOrigin: Record<string, OriginStats>;
};

export type ActiveSession = {
  startedAt: number;
  stats: SessionStats;
  queue: QueueEntry[];
  queueTrimmed: boolean;
};

export type CompletedSession = ActiveSession & {
  id: string;
  endedAt: number;
  durationMs: number;
};

export type ScheduleRule = {
  id: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
};

export type ScheduleConfig = {
  enabled: boolean;
  rules: ScheduleRule[];
  pausedByUser: boolean;
};

export type ScheduleOverride = {
  active: boolean;
  lastToggledAt: number;
};

export type StorageSchema = {
  focusModeActive: boolean;
  permissionSnapshot: Record<string, NotificationSetting>;
  whitelist: string[];
  activeSession: ActiveSession | null;
  lastCompletedSession: CompletedSession | null;
  sessionHistory: CompletedSession[];
  schedule: ScheduleConfig;
  scheduleOverride: ScheduleOverride | null;
};

export type BlockEventType = 'notification' | 'permission' | 'push';
