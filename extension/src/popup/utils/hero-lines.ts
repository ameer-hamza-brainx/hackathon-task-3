import { formatDuration } from './formatters';

export function getHeroLine(
  notificationCount: number,
  durationMs: number,
): string {
  const duration = formatDuration(durationMs);

  if (notificationCount > 10) {
    return `You blocked ${notificationCount} interruptions in ${duration}`;
  }

  if (notificationCount === 0) {
    return `0 interruptions — uninterrupted focus for ${duration}`;
  }

  if (notificationCount <= 3) {
    return `Only ${notificationCount} interruption${notificationCount === 1 ? '' : 's'} — nice focus session`;
  }

  return `${notificationCount} interruptions blocked in ${duration}`;
}
