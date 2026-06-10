import { formatDuration } from '../utils/formatters';

type Props = {
  elapsedMs: number;
};

export function SessionTimer({ elapsedMs }: Props) {
  return (
    <div className="text-center py-4">
      <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Session duration</p>
      <p className="text-3xl font-bold text-focus-active tabular-nums">
        {formatDuration(elapsedMs)}
      </p>
    </div>
  );
}
