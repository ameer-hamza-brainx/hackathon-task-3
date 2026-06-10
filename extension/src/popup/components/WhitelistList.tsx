import { getDisplayHost } from '../../shared/origin-utils';

type Props = {
  whitelist: string[];
  onRemove: (origin: string) => void;
};

export function WhitelistList({ whitelist, onRemove }: Props) {
  if (whitelist.length === 0) {
    return (
      <p className="text-sm text-slate-500 text-center py-4">
        No whitelisted sites. All notifications are blocked during Focus Mode.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {whitelist.map((origin) => (
        <li
          key={origin}
          className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate">
              {getDisplayHost(origin)}
            </p>
            <p className="text-xs text-slate-400 truncate" title={origin}>
              {origin}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(origin)}
            className="ml-2 text-xs text-red-500 hover:text-red-700 shrink-0"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
