type Props = {
  active: boolean;
  onToggle: () => void;
};

export function FocusToggle({ active, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
        active
          ? 'bg-focus-active hover:bg-indigo-600 shadow-md shadow-indigo-200'
          : 'bg-slate-500 hover:bg-slate-600'
      }`}
    >
      {active ? 'Turn Focus Mode OFF' : 'Turn Focus Mode ON'}
    </button>
  );
}
