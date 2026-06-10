import { useState } from 'react';
import { normalizeToOrigin } from '../../shared/origin-utils';

type Props = {
  onAdd: (origin: string) => Promise<{ ok: boolean; error?: string }>;
};

export function WhitelistForm({ onAdd }: Props) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const origin = normalizeToOrigin(input);
    if (!origin) {
      setError('Enter a valid URL or origin (e.g. https://app.slack.com)');
      return;
    }
    setLoading(true);
    const result = await onAdd(origin);
    setLoading(false);
    if (result.ok) {
      setInput('');
    } else {
      setError(result.error || 'Could not add origin');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        Add allowed origin
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://app.example.com"
          className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-focus-active"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-2 text-sm font-medium text-white bg-focus-active rounded-lg hover:bg-indigo-600 disabled:opacity-50"
        >
          Add
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-slate-500">
        Whitelist is per origin, not whole domain. Subdomains like app.example.com
        and api.example.com are separate.
      </p>
    </form>
  );
}
