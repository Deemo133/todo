import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoFilter } from './TodoFilter';

describe('TodoFilter', () => {
  it('renders All, Active, and Completed buttons', () => {
    render(<TodoFilter current="all" onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Active' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Completed' })).toBeInTheDocument();
  });

  it('marks the current filter button with the "active" class', () => {
    render(<TodoFilter current="active" onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Active' })).toHaveClass('active');
  });

  it('does not mark non-current filter buttons with the "active" class', () => {
    render(<TodoFilter current="active" onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'All' })).not.toHaveClass('active');
    expect(screen.getByRole('button', { name: 'Completed' })).not.toHaveClass('active');
  });

  it('sets aria-pressed="true" on the current filter button', () => {
    render(<TodoFilter current="completed" onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Completed' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('sets aria-pressed="false" on non-current filter buttons', () => {
    render(<TodoFilter current="completed" onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Active' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange with "active" when Active is clicked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TodoFilter current="all" onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Active' }));
    expect(onChange).toHaveBeenCalledWith('active');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('calls onChange with "completed" when Completed is clicked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TodoFilter current="all" onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Completed' }));
    expect(onChange).toHaveBeenCalledWith('completed');
  });

  it('calls onChange with "all" when All is clicked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TodoFilter current="active" onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'All' }));
    expect(onChange).toHaveBeenCalledWith('all');
  });

  it('renders the filter group with aria-label', () => {
    render(<TodoFilter current="all" onChange={vi.fn()} />);
    expect(screen.getByRole('group', { name: /filter todos/i })).toBeInTheDocument();
  });
});
