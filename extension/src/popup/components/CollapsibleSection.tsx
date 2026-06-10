import { useState, type ReactNode } from 'react';

type Props = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function CollapsibleSection({ title, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-left text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100"
      >
        <span>{title}</span>
        <span className="text-slate-400">{open ? '▼' : '▶'}</span>
      </button>
      {open && <div className="px-3 py-2 border-t border-slate-200">{children}</div>}
    </div>
  );
}
