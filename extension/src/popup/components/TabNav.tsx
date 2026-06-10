export type AppTab = 'status' | 'history' | 'whitelist' | 'schedule';

type Props = {
  active: AppTab;
  onChange: (tab: AppTab) => void;
};

export function TabNav({ active, onChange }: Props) {
  const tabs: { id: AppTab; label: string }[] = [
    { id: 'status', label: 'Status' },
    { id: 'history', label: 'History' },
    { id: 'whitelist', label: 'Whitelist' },
    { id: 'schedule', label: 'Schedule' },
  ];

  return (
    <nav className="flex border-b border-slate-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`flex-1 py-2 text-xs font-medium transition-colors ${
            active === tab.id
              ? 'text-focus-active border-b-2 border-focus-active'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
