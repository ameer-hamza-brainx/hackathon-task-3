import { useState } from 'react';
import { exportAndDownloadSessions } from '../utils/csv-export';

type Props = {
  sessionIds: string[];
  label?: string;
  className?: string;
};

export function ExportCsvButton({
  sessionIds,
  label = 'Export CSV',
  className = '',
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      await exportAndDownloadSessions(sessionIds);
    } catch {
      // Export failed silently; user can retry
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading || sessionIds.length === 0}
      className={`text-sm font-medium text-focus-active hover:text-indigo-700 disabled:opacity-50 ${className}`}
    >
      {loading ? 'Exporting…' : label}
    </button>
  );
}
