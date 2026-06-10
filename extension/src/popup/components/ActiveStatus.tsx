import { SessionTimer } from './SessionTimer';

type Props = {
  elapsedMs: number;
};

export function ActiveStatus({ elapsedMs }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 justify-center">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-focus-active opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-focus-active" />
        </span>
        <h2 className="text-lg font-semibold text-slate-800">Focus Mode is ON</h2>
      </div>

      <SessionTimer elapsedMs={elapsedMs} />

      <p className="text-xs text-slate-500 text-center leading-relaxed">
        Notifications are hidden and saved for review when you turn off.
        Browser notifications only — in-page alerts are not blocked.
      </p>

      <p className="text-xs text-slate-400 text-center">
        Shortcut: <kbd className="px-1 py-0.5 bg-slate-100 rounded text-slate-600">Alt+Shift+F</kbd>
      </p>
    </div>
  );
}
