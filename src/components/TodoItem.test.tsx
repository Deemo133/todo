import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoItem } from './TodoItem';
import type { Todo } from '../types/todo';

const mockTodo: Todo = {
  id: 'test-id',
  text: 'Test todo',
  completed: false,
  createdAt: 1000,
};

const completedTodo: Todo = {
  ...mockTodo,
  completed: true,
};

describe('TodoItem', () => {
  describe('rendering', () => {
    it('renders the todo text', () => {
      render(<TodoItem todo={mockTodo} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
      expect(screen.getByText('Test todo')).toBeInTheDocument();
    });

    it('renders an unchecked checkbox for an incomplete todo', () => {
      render(<TodoItem todo={mockTodo} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('renders a checked checkbox for a completed todo', () => {
      render(<TodoItem todo={completedTodo} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('applies the "completed" class for a completed todo', () => {
      render(<TodoItem todo={completedTodo} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
      expect(screen.getByRole('listitem')).toHaveClass('completed');
    });

    it('does not apply the "completed" class for an incomplete todo', () => {
      render(<TodoItem todo={mockTodo} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
      expect(screen.getByRole('listitem')).not.toHaveClass('completed');
    });

    it('renders a delete button', () => {
      render(<TodoItem todo={mockTodo} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });
  });

  describe('toggle', () => {
    it('calls onToggle with the todo id when checkbox is clicked', async () => {
      const onToggle = vi.fn();
      const user = userEvent.setup();
      render(<TodoItem todo={mockTodo} onToggle={onToggle} onDelete={vi.fn()} onEdit={vi.fn()} />);
      await user.click(screen.getByRole('checkbox'));
      expect(onToggle).toHaveBeenCalledWith('test-id');
      expect(onToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('calls onDelete with the todo id when delete button is clicked', async () => {
      const onDelete = vi.fn();
      const user = userEvent.setup();
      render(<TodoItem todo={mockTodo} onToggle={vi.fn()} onDelete={onDelete} onEdit={vi.fn()} />);
      await user.click(screen.getByRole('button', { name: /delete/i }));
      expect(onDelete).toHaveBeenCalledWith('test-id');
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('inline editing', () => {
    it('enters edit mode when the todo text is clicked', async () => {
      const user = userEvent.setup();
      render(<TodoItem todo={mockTodo} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
      await user.click(screen.getByText('Test todo'));
      expect(screen.getByRole('textbox', { name: /edit todo text/i })).toBeInTheDocument();
    });

    it('shows the current text in the edit input', async () => {
      const user = userEvent.setup();
      render(<TodoItem todo={mockTodo} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
      await user.click(screen.getByText('Test todo'));
      expect(screen.getByRole('textbox', { name: /edit todo text/i })).toHaveValue('Test todo');
    });

    it('hides the text span when in edit mode', async () => {
      const user = userEvent.setup();
      render(<TodoItem todo={mockTodo} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
      await user.click(screen.getByText('Test todo'));
      expect(screen.queryByText('Test todo')).not.toBeInTheDocument();
    });

    it('calls onEdit and exits edit mode when Enter is pressed', async () => {
      const onEdit = vi.fn();
      const user = userEvent.setup();
      render(<TodoItem todo={mockTodo} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);
      await user.click(screen.getByText('Test todo'));
      const editInput = screen.getByRole('textbox', { name: /edit todo text/i });
      await user.clear(editInput);
      await user.type(editInput, 'Updated todo');
      await user.keyboard('{Enter}');
      expect(onEdit).toHaveBeenCalledWith('test-id', 'Updated todo');
      expect(screen.queryByRole('textbox', { name: /edit todo text/i })).not.toBeInTheDocument();
    });

    it('cancels edit and shows original text when Escape is pressed', async () => {
      const onEdit = vi.fn();
      const user = userEvent.setup();
      render(<TodoItem todo={mockTodo} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);
      await user.click(screen.getByText('Test todo'));
      const editInput = screen.getByRole('textbox', { name: /edit todo text/i });
      await user.clear(editInput);
      await user.type(editInput, 'Different text');
      await user.keyboard('{Escape}');
      // Edit mode should be exited and original text visible
      expect(screen.getByText('Test todo')).toBeInTheDocument();
      expect(screen.queryByText('Different text')).not.toBeInTheDocument();
    });

    it('commits the edit when the input loses focus (blur)', async () => {
      const onEdit = vi.fn();
      const user = userEvent.setup();
      render(<TodoItem todo={mockTodo} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);
      await user.click(screen.getByText('Test todo'));
      const editInput = screen.getByRole('textbox', { name: /edit todo text/i });
      await user.clear(editInput);
      await user.type(editInput, 'Blur commit');
      await user.tab(); // triggers blur
      expect(onEdit).toHaveBeenCalledWith('test-id', 'Blur commit');
    });
  });
});
