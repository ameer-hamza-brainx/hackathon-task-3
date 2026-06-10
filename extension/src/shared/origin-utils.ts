const ORIGIN_PATTERN = /^https?:\/\/[^\s/]+(?::\d+)?$/;

export function normalizeToOrigin(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    const withScheme = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const url = new URL(withScheme);
    return url.origin;
  } catch {
    return null;
  }
}

export function isValidOrigin(origin: string): boolean {
  return ORIGIN_PATTERN.test(origin);
}

export function getDisplayHost(origin: string): string {
  if (origin === 'blocked') return 'blocked';
  try {
    return new URL(origin).host;
  } catch {
    return origin;
  }
}

export function sanitizeOrigin(origin: string): string {
  if (!origin || origin === 'null' || origin === 'undefined') {
    return 'blocked';
  }
  try {
    return new URL(origin).origin;
  } catch {
    return 'blocked';
  }
}
