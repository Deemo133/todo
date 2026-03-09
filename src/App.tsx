import { useTodos } from './hooks/useTodos';
import { TodoInput } from './components/TodoInput';
import { TodoItem } from './components/TodoItem';
import { TodoFilter } from './components/TodoFilter';
import { TodoFooter } from './components/TodoFooter';
import './App.css';

function App() {
  const {
    todos,
    filter,
    setFilter,
    activeCount,
    completedCount,
    addTodo,
    deleteTodo,
    toggleTodo,
    editTodo,
    clearCompleted,
  } = useTodos();

  return (
    <div className="app">
      <div className="todo-container">
        <header className="todo-header">
          <h1 className="todo-title">todos</h1>
        </header>

        <main className="todo-main">
          <TodoInput onAdd={addTodo} />

          {todos.length > 0 ? (
            <ul className="todo-list">
              {todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                  onEdit={editTodo}
                />
              ))}
            </ul>
          ) : (
            <div className="todo-empty">
              {filter === 'all'
                ? 'No todos yet. Add one above!'
                : filter === 'active'
                ? 'No active todos.'
                : 'No completed todos.'}
            </div>
          )}
        </main>

        <footer className="todo-footer-section">
          <TodoFooter
            activeCount={activeCount}
            completedCount={completedCount}
            onClearCompleted={clearCompleted}
          />
          <TodoFilter current={filter} onChange={setFilter} />
        </footer>
      </div>
    </div>
  );
}

export default App;
