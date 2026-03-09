import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoInput } from './TodoInput';

describe('TodoInput', () => {
  it('renders the text input and Add button', () => {
    render(<TodoInput onAdd={vi.fn()} />);
    expect(screen.getByRole('textbox', { name: /new todo text/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add todo/i })).toBeInTheDocument();
  });

  it('renders placeholder text', () => {
    render(<TodoInput onAdd={vi.fn()} />);
    expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
  });

  it('calls onAdd with the typed text when Add button is clicked', async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<TodoInput onAdd={onAdd} />);
    await user.type(screen.getByRole('textbox'), 'Buy milk');
    await user.click(screen.getByRole('button', { name: /add todo/i }));
    expect(onAdd).toHaveBeenCalledWith('Buy milk');
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('clears the input after clicking Add', async () => {
    const user = userEvent.setup();
    render(<TodoInput onAdd={vi.fn()} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'Test todo');
    await user.click(screen.getByRole('button', { name: /add todo/i }));
    expect(input).toHaveValue('');
  });

  it('calls onAdd when Enter key is pressed', async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<TodoInput onAdd={onAdd} />);
    await user.type(screen.getByRole('textbox'), 'Enter todo{Enter}');
    expect(onAdd).toHaveBeenCalledWith('Enter todo');
  });

  it('clears the input after pressing Enter', async () => {
    const user = userEvent.setup();
    render(<TodoInput onAdd={vi.fn()} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'Test{Enter}');
    expect(input).toHaveValue('');
  });

  it('does not call onAdd when input is empty', async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<TodoInput onAdd={onAdd} />);
    await user.click(screen.getByRole('button', { name: /add todo/i }));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('does not call onAdd when input is whitespace only', async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<TodoInput onAdd={onAdd} />);
    await user.type(screen.getByRole('textbox'), '   ');
    await user.click(screen.getByRole('button', { name: /add todo/i }));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('does not call onAdd when Enter is pressed on empty input', async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<TodoInput onAdd={onAdd} />);
    await user.type(screen.getByRole('textbox'), '{Enter}');
    expect(onAdd).not.toHaveBeenCalled();
  });
});
