import { FilterType } from '../types/todo';

interface TodoFilterProps {
  current: FilterType;
  onChange: (filter: FilterType) => void;
}

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
];

export function TodoFilter({ current, onChange }: TodoFilterProps) {
  return (
    <div className="todo-filter" role="group" aria-label="Filter todos">
      {FILTERS.map(({ label, value }) => (
        <button
          key={value}
          className={`btn-filter${current === value ? ' active' : ''}`}
          onClick={() => onChange(value)}
          aria-pressed={current === value}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
