import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoFooter } from './TodoFooter';

describe('TodoFooter', () => {
  describe('item count display', () => {
    it('shows "1 item left" for singular count', () => {
      const { container } = render(
        <TodoFooter activeCount={1} completedCount={0} onClearCompleted={vi.fn()} />
      );
      expect(container.querySelector('.todo-count')).toHaveTextContent('1 item left');
    });

    it('shows "items left" for plural count', () => {
      const { container } = render(
        <TodoFooter activeCount={3} completedCount={0} onClearCompleted={vi.fn()} />
      );
      expect(container.querySelector('.todo-count')).toHaveTextContent('3 items left');
    });

    it('shows "0 items left" when there are no active todos', () => {
      const { container } = render(
        <TodoFooter activeCount={0} completedCount={0} onClearCompleted={vi.fn()} />
      );
      expect(container.querySelector('.todo-count')).toHaveTextContent('0 items left');
    });

    it('shows "2 items left" for count of 2', () => {
      const { container } = render(
        <TodoFooter activeCount={2} completedCount={1} onClearCompleted={vi.fn()} />
      );
      expect(container.querySelector('.todo-count')).toHaveTextContent('2 items left');
    });
  });

  describe('Clear completed button', () => {
    it('does not render the button when completedCount is 0', () => {
      render(<TodoFooter activeCount={2} completedCount={0} onClearCompleted={vi.fn()} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders the button when completedCount is greater than 0', () => {
      render(<TodoFooter activeCount={1} completedCount={2} onClearCompleted={vi.fn()} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('shows the completed count inside the button text', () => {
      render(<TodoFooter activeCount={1} completedCount={3} onClearCompleted={vi.fn()} />);
      expect(screen.getByRole('button')).toHaveTextContent('Clear completed (3)');
    });

    it('calls onClearCompleted when the button is clicked', async () => {
      const onClearCompleted = vi.fn();
      const user = userEvent.setup();
      render(<TodoFooter activeCount={1} completedCount={2} onClearCompleted={onClearCompleted} />);
      await user.click(screen.getByRole('button'));
      expect(onClearCompleted).toHaveBeenCalledTimes(1);
    });
  });
});
