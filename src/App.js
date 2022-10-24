import React, { useEffect, useRef, useState } from 'react';
import api from './api';
import './styles.css';

const formatDate = (date) => {
  const dtFormat = new Intl.DateTimeFormat('en', {
    timeZone: 'UTC',
    weekday: 'short',
    year: '2-digit',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  return dtFormat.format(new Date(date));
};

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
    <div className="bg-slate-900 min-h-screen p-5">
      <div className="mx-auto py-8 max-w-4xl">
        <h1 className="uppercase font-bold text-slate-300 mb-1">
          ✅ My awesome task list
        </h1>
        <form onSubmit={(e) => e.preventDefault()} className="flex">
          <input
            ref={textbox}
            type="text"
            placeholder="Enter something to do."
            className="rounded w-full px-4 py-4 bg-slate-700 text-white truncate"
          />
          <button
            onClick={add}
            className="rounded ml-1 px-20 py-4 bg-green-700 text-white"
          >
            Add
          </button>
        </form>
        {error && (
          <div className="rounded my-1 bg-red-700 text-red-300 px-4 py-2">
            <strong className="font-bold">Something went wrong!</strong> {error}
          </div>
        )}
        {todos?.length === 0 && (
          <div className="rounded my-1 bg-blue-700 text-blue-300 px-4 py-2">
            There is nothing to do.
          </div>
        )}
        {todos?.map((todo) => {
          return (
            <div
              key={todo.id}
              className="flex items-center justify-between py-2 px-5 border border-slate-800 my-1 rounded text-gray-300 hover:bg-slate-800"
            >
              <span className="flex items-center">
                <button
                  onClick={() => remove(todo.id)}
                  className="mr-2 text-red-500 text-3xl"
                >
                  &times;
                </button>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onClick={() => toggle(todo)}
                  className="w-8 h-8 mr-2 text-green-500 focus:ring-green-400 focus:ring-opacity-25 border border-gray-300 rounded cursor-pointer"
                />
                <span
                  className="px-2 text-3xl"
                  style={{
                    textDecoration: todo.completed ? 'line-through' : '',
                  }}
                >
                  {todo.text}
                </span>
              </span>
              <div className="text-right">
                <div>{formatDate(todo.created)}</div>
                <div className="text-xs text-gray-500">{todo.id}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;
