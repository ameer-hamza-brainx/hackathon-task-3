import type { BlockEventType, ScheduleConfig } from './types';

export enum MessageType {
  TOGGLE_FOCUS_MODE = 'TOGGLE_FOCUS_MODE',
  GET_STATE = 'GET_STATE',
  STATE_UPDATED = 'STATE_UPDATED',
  NOTIFICATION_BLOCKED = 'NOTIFICATION_BLOCKED',
  PERMISSION_BLOCKED = 'PERMISSION_BLOCKED',
  PUSH_BLOCKED = 'PUSH_BLOCKED',
  ADD_WHITELIST = 'ADD_WHITELIST',
  REMOVE_WHITELIST = 'REMOVE_WHITELIST',
  SAVE_SCHEDULE = 'SAVE_SCHEDULE',
  DISABLE_SCHEDULE = 'DISABLE_SCHEDULE',
  ENABLE_SCHEDULE = 'ENABLE_SCHEDULE',
  GET_NEXT_SCHEDULE_ON = 'GET_NEXT_SCHEDULE_ON',
  EXPORT_CSV = 'EXPORT_CSV',
}

export type NotificationBlockedPayload = {
  origin: string;
  message: string;
  type: 'notification' | 'push';
};

export type PermissionBlockedPayload = {
  origin: string;
};

export type PushBlockedPayload = {
  origin: string;
  message?: string;
};

export type WhitelistPayload = {
  origin: string;
};

export type SaveSchedulePayload = {
  schedule: ScheduleConfig;
};

export type ExportCsvPayload = {
  sessionIds?: string[];
};

export type RuntimeMessage =
  | { type: MessageType.TOGGLE_FOCUS_MODE }
  | { type: MessageType.GET_STATE }
  | { type: MessageType.STATE_UPDATED; payload: unknown }
  | { type: MessageType.NOTIFICATION_BLOCKED; payload: NotificationBlockedPayload }
  | { type: MessageType.PERMISSION_BLOCKED; payload: PermissionBlockedPayload }
  | { type: MessageType.PUSH_BLOCKED; payload: PushBlockedPayload }
  | { type: MessageType.ADD_WHITELIST; payload: WhitelistPayload }
  | { type: MessageType.REMOVE_WHITELIST; payload: WhitelistPayload }
  | { type: MessageType.SAVE_SCHEDULE; payload: SaveSchedulePayload }
  | { type: MessageType.DISABLE_SCHEDULE }
  | { type: MessageType.ENABLE_SCHEDULE }
  | { type: MessageType.GET_NEXT_SCHEDULE_ON }
  | { type: MessageType.EXPORT_CSV; payload?: ExportCsvPayload };

export type ContentBlockMessage = {
  type: typeof import('./constants').FOCUS_MODE_MESSAGE_TYPE;
  eventType: BlockEventType;
  origin: string;
  message?: string;
};
