import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

beforeEach(() => {
  localStorage.clear();
});

describe('App', () => {
  describe('initial render', () => {
    it('renders the todos title', () => {
      render(<App />);
      expect(screen.getByRole('heading', { name: 'todos' })).toBeInTheDocument();
    });

    it('shows empty state message when there are no todos', () => {
      render(<App />);
      expect(screen.getByText(/No todos yet/)).toBeInTheDocument();
    });

    it('shows the filter buttons', () => {
      render(<App />);
      expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Active' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Completed' })).toBeInTheDocument();
    });
  });

  describe('adding todos', () => {
    it('adds a todo and displays it in the list', async () => {
      const user = userEvent.setup();
      render(<App />);
      await user.type(screen.getByRole('textbox', { name: /new todo text/i }), 'Buy milk');
      await user.click(screen.getByRole('button', { name: /add todo/i }));
      expect(screen.getByText('Buy milk')).toBeInTheDocument();
    });

    it('adds multiple todos', async () => {
      const user = userEvent.setup();
      render(<App />);
      const input = screen.getByRole('textbox', { name: /new todo text/i });
      const addBtn = screen.getByRole('button', { name: /add todo/i });
      await user.type(input, 'First todo');
      await user.click(addBtn);
      await user.type(input, 'Second todo');
      await user.click(addBtn);
      expect(screen.getByText('First todo')).toBeInTheDocument();
      expect(screen.getByText('Second todo')).toBeInTheDocument();
    });

    it('hides the empty state message after adding a todo', async () => {
      const user = userEvent.setup();
      render(<App />);
      await user.type(screen.getByRole('textbox', { name: /new todo text/i }), 'Task');
      await user.click(screen.getByRole('button', { name: /add todo/i }));
      expect(screen.queryByText(/No todos yet/)).not.toBeInTheDocument();
    });
  });

  describe('toggling todos', () => {
    it('marks a todo as completed when checkbox is clicked', async () => {
      const user = userEvent.setup();
      render(<App />);
      await user.type(screen.getByRole('textbox', { name: /new todo text/i }), 'Buy milk');
      await user.click(screen.getByRole('button', { name: /add todo/i }));
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('updates the item count when a todo is completed', async () => {
      const user = userEvent.setup();
      const { container } = render(<App />);
      await user.type(screen.getByRole('textbox', { name: /new todo text/i }), 'Task');
      await user.click(screen.getByRole('button', { name: /add todo/i }));
      await user.click(screen.getByRole('checkbox'));
      // activeCount becomes 0 after completing the only todo
      expect(container.querySelector('.todo-count')).toHaveTextContent('0 items left');
    });
  });

  describe('deleting todos', () => {
    it('removes a todo when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<App />);
      await user.type(screen.getByRole('textbox', { name: /new todo text/i }), 'Buy milk');
      await user.click(screen.getByRole('button', { name: /add todo/i }));
      await user.click(screen.getByRole('button', { name: /delete/i }));
      expect(screen.queryByText('Buy milk')).not.toBeInTheDocument();
    });

    it('shows empty state after all todos are deleted', async () => {
      const user = userEvent.setup();
      render(<App />);
      await user.type(screen.getByRole('textbox', { name: /new todo text/i }), 'Task');
      await user.click(screen.getByRole('button', { name: /add todo/i }));
      await user.click(screen.getByRole('button', { name: /delete/i }));
      expect(screen.getByText(/No todos yet/)).toBeInTheDocument();
    });
  });

  describe('filtering', () => {
    async function addTwoTodos(user: ReturnType<typeof userEvent.setup>) {
      const input = screen.getByRole('textbox', { name: /new todo text/i });
      const addBtn = screen.getByRole('button', { name: /add todo/i });
      await user.type(input, 'Active todo');
      await user.click(addBtn);
      await user.type(input, 'Done todo');
      await user.click(addBtn);
      // 'Done todo' is at index 0 (newest first)
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]); // complete 'Done todo'
    }

    it('shows only active todos when "Active" filter is selected', async () => {
      const user = userEvent.setup();
      render(<App />);
      await addTwoTodos(user);
      await user.click(screen.getByRole('button', { name: 'Active' }));
      expect(screen.getByText('Active todo')).toBeInTheDocument();
      expect(screen.queryByText('Done todo')).not.toBeInTheDocument();
    });

    it('shows only completed todos when "Completed" filter is selected', async () => {
      const user = userEvent.setup();
      render(<App />);
      await addTwoTodos(user);
      await user.click(screen.getByRole('button', { name: 'Completed' }));
      expect(screen.getByText('Done todo')).toBeInTheDocument();
      expect(screen.queryByText('Active todo')).not.toBeInTheDocument();
    });

    it('shows all todos when "All" filter is selected', async () => {
      const user = userEvent.setup();
      render(<App />);
      await addTwoTodos(user);
      await user.click(screen.getByRole('button', { name: 'Active' }));
      await user.click(screen.getByRole('button', { name: 'All' }));
      expect(screen.getByText('Active todo')).toBeInTheDocument();
      expect(screen.getByText('Done todo')).toBeInTheDocument();
    });

    it('shows empty state with appropriate message when no active todos', async () => {
      const user = userEvent.setup();
      render(<App />);
      await user.type(screen.getByRole('textbox', { name: /new todo text/i }), 'Task');
      await user.click(screen.getByRole('button', { name: /add todo/i }));
      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: 'Active' }));
      expect(screen.getByText(/No active todos/)).toBeInTheDocument();
    });
  });

  describe('clear completed', () => {
    it('removes all completed todos when "Clear completed" is clicked', async () => {
      const user = userEvent.setup();
      render(<App />);
      const input = screen.getByRole('textbox', { name: /new todo text/i });
      const addBtn = screen.getByRole('button', { name: /add todo/i });
      await user.type(input, 'Keep');
      await user.click(addBtn);
      await user.type(input, 'Remove');
      await user.click(addBtn);
      // 'Remove' is at index 0 (newest first)
      await user.click(screen.getAllByRole('checkbox')[0]);
      await user.click(screen.getByRole('button', { name: /clear completed/i }));
      expect(screen.queryByText('Remove')).not.toBeInTheDocument();
      expect(screen.getByText('Keep')).toBeInTheDocument();
    });

    it('does not show "Clear completed" button when no todos are completed', async () => {
      const user = userEvent.setup();
      render(<App />);
      await user.type(screen.getByRole('textbox', { name: /new todo text/i }), 'Active task');
      await user.click(screen.getByRole('button', { name: /add todo/i }));
      expect(screen.queryByRole('button', { name: /clear completed/i })).not.toBeInTheDocument();
    });
  });
});
