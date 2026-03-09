import { renderHook, act } from '@testing-library/react';
import { useTodos } from './useTodos';

const STORAGE_KEY = 'react-todo-app';

beforeEach(() => {
  localStorage.clear();
});

describe('useTodos', () => {
  describe('initial state', () => {
    it('starts with empty todos when localStorage is empty', () => {
      const { result } = renderHook(() => useTodos());
      expect(result.current.todos).toEqual([]);
      expect(result.current.filter).toBe('all');
      expect(result.current.activeCount).toBe(0);
      expect(result.current.completedCount).toBe(0);
    });

    it('loads todos from localStorage on init', () => {
      const stored = [{ id: '1', text: 'Test', completed: false, createdAt: 1000 }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      const { result } = renderHook(() => useTodos());
      expect(result.current.todos).toEqual(stored);
    });

    it('returns empty array when localStorage contains invalid JSON', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid-json');
      const { result } = renderHook(() => useTodos());
      expect(result.current.todos).toEqual([]);
    });
  });

  describe('addTodo', () => {
    it('adds a new todo', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('Buy milk'); });
      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe('Buy milk');
      expect(result.current.todos[0].completed).toBe(false);
      expect(result.current.todos[0].id).toBeDefined();
    });

    it('trims whitespace from todo text', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('  Buy milk  '); });
      expect(result.current.todos[0].text).toBe('Buy milk');
    });

    it('ignores empty string', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo(''); });
      expect(result.current.todos).toHaveLength(0);
    });

    it('ignores whitespace-only string', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('   '); });
      expect(result.current.todos).toHaveLength(0);
    });

    it('prepends new todo to the front', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('First'); });
      act(() => { result.current.addTodo('Second'); });
      expect(result.current.todos[0].text).toBe('Second');
      expect(result.current.todos[1].text).toBe('First');
    });
  });

  describe('deleteTodo', () => {
    it('removes a todo by id', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('Test'); });
      const id = result.current.todos[0].id;
      act(() => { result.current.deleteTodo(id); });
      expect(result.current.todos).toHaveLength(0);
    });

    it('only removes the matching todo', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('First'); });
      act(() => { result.current.addTodo('Second'); });
      // 'Second' is at index 0 (prepended), 'First' is at index 1
      const idToDelete = result.current.todos[1].id; // 'First'
      act(() => { result.current.deleteTodo(idToDelete); });
      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe('Second');
    });
  });

  describe('toggleTodo', () => {
    it('sets completed to true', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('Test'); });
      const id = result.current.todos[0].id;
      act(() => { result.current.toggleTodo(id); });
      expect(result.current.todos[0].completed).toBe(true);
    });

    it('sets completed back to false', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('Test'); });
      const id = result.current.todos[0].id;
      act(() => { result.current.toggleTodo(id); });
      act(() => { result.current.toggleTodo(id); });
      expect(result.current.todos[0].completed).toBe(false);
    });
  });

  describe('editTodo', () => {
    it('updates todo text', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('Old text'); });
      const id = result.current.todos[0].id;
      act(() => { result.current.editTodo(id, 'New text'); });
      expect(result.current.todos[0].text).toBe('New text');
    });

    it('trims whitespace on edit', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('Test'); });
      const id = result.current.todos[0].id;
      act(() => { result.current.editTodo(id, '  Updated  '); });
      expect(result.current.todos[0].text).toBe('Updated');
    });

    it('deletes the todo when new text is empty', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('Test'); });
      const id = result.current.todos[0].id;
      act(() => { result.current.editTodo(id, ''); });
      expect(result.current.todos).toHaveLength(0);
    });

    it('deletes the todo when new text is whitespace only', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('Test'); });
      const id = result.current.todos[0].id;
      act(() => { result.current.editTodo(id, '   '); });
      expect(result.current.todos).toHaveLength(0);
    });
  });

  describe('clearCompleted', () => {
    it('removes all completed todos', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('Active'); });
      act(() => { result.current.addTodo('Done'); });
      // 'Done' is index 0 (prepended last)
      act(() => { result.current.toggleTodo(result.current.todos[0].id); });
      act(() => { result.current.clearCompleted(); });
      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe('Active');
    });

    it('does nothing when there are no completed todos', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('Active'); });
      act(() => { result.current.clearCompleted(); });
      expect(result.current.todos).toHaveLength(1);
    });
  });

  describe('filtering', () => {
    function setupTwoTodos() {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('Active'); });
      act(() => { result.current.addTodo('Done'); });
      // 'Done' is index 0, 'Active' is index 1
      act(() => { result.current.toggleTodo(result.current.todos[0].id); }); // complete 'Done'
      return result;
    }

    it('filter "all" shows all todos (default)', () => {
      const result = setupTwoTodos();
      expect(result.current.todos).toHaveLength(2);
    });

    it('filter "active" shows only incomplete todos', () => {
      const result = setupTwoTodos();
      act(() => { result.current.setFilter('active'); });
      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe('Active');
    });

    it('filter "completed" shows only completed todos', () => {
      const result = setupTwoTodos();
      act(() => { result.current.setFilter('completed'); });
      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe('Done');
    });
  });

  describe('counts', () => {
    it('correctly tracks activeCount and completedCount', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('A'); });
      act(() => { result.current.addTodo('B'); });
      act(() => { result.current.addTodo('C'); });
      act(() => { result.current.toggleTodo(result.current.todos[0].id); });
      expect(result.current.activeCount).toBe(2);
      expect(result.current.completedCount).toBe(1);
    });

    it('shows 0 for both counts when todos list is empty', () => {
      const { result } = renderHook(() => useTodos());
      expect(result.current.activeCount).toBe(0);
      expect(result.current.completedCount).toBe(0);
    });
  });

  describe('localStorage persistence', () => {
    it('saves todos to localStorage when a todo is added', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('Persisted'); });
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as { text: string }[];
      expect(stored).toHaveLength(1);
      expect(stored[0].text).toBe('Persisted');
    });

    it('removes todo from localStorage when deleted', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('Delete me'); });
      const id = result.current.todos[0].id;
      act(() => { result.current.deleteTodo(id); });
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as unknown[];
      expect(stored).toHaveLength(0);
    });
  });
});
