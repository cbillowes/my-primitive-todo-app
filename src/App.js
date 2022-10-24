import React, { useEffect, useRef, useState } from 'react';
import api from './api';

const App = () => {
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState();
  const textbox = useRef();

  const setAndSortTodos = (items) => {
    setTodos(items.sort((x, y) => y.created - x.created));
  };

  const tryInteractWithApi = (interaction, errorMessage) => {
    try {
      return interaction();
    } catch (e) {
      setError(errorMessage);
      console.error(errorMessage, e);
    }
  };

  useEffect(() => {
    const loadTodos = async () => {
      const result = await tryInteractWithApi(
        api.getTodos,
        'We could not get your tasks at this time.',
      );
      setAndSortTodos(result);
    };
    loadTodos();
  }, []);

  const add = async () => {
    const task = textbox.current.value;
    if (task) {
      const result = await tryInteractWithApi(
        () => api.createTodo(task),
        `We could not add your task: ${task}.`,
      );
      if (result) {
        setAndSortTodos([...todos, result]);
        textbox.current.value = '';
      }
    }
  };

  const remove = async (id) => {
    const result = await tryInteractWithApi(
      () => api.deleteTodo(id),
      `We could not delete your task ${id}.`,
    );
    if (result) {
      setAndSortTodos(todos.filter((t) => t.id !== id));
    }
  };

  const toggle = async (todo) => {
    const updatedTodo = {
      ...todo,
      completed: !todo.completed,
    };
    const result = await tryInteractWithApi(
      () => api.updateTodo(updatedTodo),
      `We could not toggle your task ${todo.id}`,
    );
    if (result) {
      setAndSortTodos(todos.map((t) => (t.id === todo.id ? updatedTodo : t)));
    }
  };

  return (
    <>
      <form onSubmit={(e) => e.preventDefault()}>
        <input ref={textbox} type="text" />
        <button onClick={add}>Add</button>
      </form>
      {error && (
        <div>
          <strong>Something went wrong!</strong> {error}
        </div>
      )}
      {todos && todos.length === 0 && <div>There is nothing to do.</div>}
      {todos &&
        todos.length > 0 &&
        todos.map((todo) => {
          return (
            <div
              key={todo.id}
              style={{
                textDecoration: todo.completed ? 'line-through' : '',
              }}
            >
              <button onClick={() => remove(todo.id)}>&times;</button>
              <input
                type="checkbox"
                checked={todo.completed}
                onClick={() => toggle(todo)}
              />
              {todo.created} | {todo.id} | {todo.text}
            </div>
          );
        })}
    </>
  );
};

export default App;
