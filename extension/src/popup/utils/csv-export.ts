import { MessageType } from '../../shared/messages';

export async function fetchCsvForSessions(sessionIds?: string[]): Promise<string> {
  const response = await chrome.runtime.sendMessage({
    type: MessageType.EXPORT_CSV,
    payload: sessionIds ? { sessionIds } : undefined,
  });
  if (!response?.ok || !response.csv) {
    throw new Error(response?.error || 'Export failed');
  }
  return response.csv as string;
}

export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportAndDownloadSessions(
  sessionIds: string[],
  filenamePrefix = 'focus-mode',
): Promise<void> {
  const csv = await fetchCsvForSessions(sessionIds);
  const suffix = sessionIds.length === 1 ? sessionIds[0].slice(0, 8) : 'sessions';
  downloadCsv(csv, `${filenamePrefix}-${suffix}.csv`);
}
