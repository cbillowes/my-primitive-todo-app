import React, { useEffect, useRef, useState } from 'react';
import api from './api';
import Fork from './Fork';
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

const Spinner = ({ text }) => {
  return (
    <span role="status">
      <svg
        className="inline mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-green-500"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">{text}...</span>
    </span>
  );
};

const App = () => {
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState();
  const [showGlobalSpinner, toggleGlobalSpinner] = useState(false);
  const [taskSpinner, toggleTaskSpinner] = useState();

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
      toggleGlobalSpinner(true);
      const result = await tryInteractWithApi(
        api.getTodos,
        'We could not get your tasks at this time.',
      );
      setAndSortTodos(result);
      toggleGlobalSpinner(false);
    };
    loadTodos();
  }, []);

  const add = async () => {
    const task = textbox.current.value;
    if (task) {
      toggleTaskSpinner({ action: 'create' });
      const result = await tryInteractWithApi(
        () => api.createTodo(task),
        `We could not add your task: ${task}.`,
      );
      if (result) {
        setAndSortTodos([...todos, result]);
        textbox.current.value = '';
      }
      toggleTaskSpinner();
    }
  };

  const remove = async (id) => {
    toggleTaskSpinner({ id, action: 'delete' });
    const result = await tryInteractWithApi(
      () => api.deleteTodo(id),
      `We could not delete your task ${id}.`,
    );
    if (result) {
      setAndSortTodos(todos.filter((t) => t.id !== id));
    }
    toggleTaskSpinner();
  };

  const toggle = async (todo) => {
    const updatedTodo = {
      ...todo,
      completed: !todo.completed,
    };
    toggleTaskSpinner({ id: todo.id, action: 'toggle' });
    const result = await tryInteractWithApi(
      () => api.updateTodo(updatedTodo),
      `We could not toggle your task ${todo.id}`,
      toggleTaskSpinner,
    );
    if (result) {
      setAndSortTodos(todos.map((t) => (t.id === todo.id ? updatedTodo : t)));
    }
    toggleTaskSpinner();
  };

  return (
    <div className="bg-slate-900 min-h-screen p-5">
      <Fork />
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
        {showGlobalSpinner && (
          <div className="my-5 px-4 py-2 text-center">
            <Spinner text="Loading" />
          </div>
        )}
        {taskSpinner?.action === 'create' && (
          <div className="my-5 px-4 py-2 text-center">
            <Spinner text="Adding" />
          </div>
        )}
        {error && (
          <div className="rounded my-1 bg-red-700 text-red-300 px-4 py-2">
            <strong className="font-bold">Something went wrong!</strong> {error}
          </div>
        )}
        {!showGlobalSpinner && todos?.length === 0 && (
          <div className="rounded my-1 bg-blue-700 text-blue-300 px-4 py-2">
            There is nothing to do.
          </div>
        )}
        {!showGlobalSpinner &&
          todos?.map((todo) => {
            return (
              <div
                key={todo.id}
                className="flex items-center justify-between py-2 px-3 border border-slate-800 my-1 rounded text-gray-300 hover:bg-slate-800"
              >
                <span className="flex items-center">
                  {taskSpinner?.id === todo.id &&
                    taskSpinner?.action === 'delete' && (
                      <Spinner text="Deleting task" />
                    )}
                  {taskSpinner?.id !== todo.id &&
                    taskSpinner?.action !== 'delete' && (
                      <button
                        onClick={() => remove(todo.id)}
                        className="mr-2 text-red-500 text-3xl"
                      >
                        &times;
                      </button>
                    )}
                  {taskSpinner?.id === todo.id &&
                    taskSpinner?.action === 'toggle' && (
                      <Spinner text="Toggling task" />
                    )}
                  {taskSpinner?.id !== todo.id && (
                    <input
                      type="checkbox"
                      defaultChecked={todo.completed}
                      onClick={() => toggle(todo)}
                      className="w-8 h-8 mr-2 text-green-500 focus:ring-green-400 focus:ring-opacity-25 border border-gray-300 rounded cursor-pointer"
                    />
                  )}
                  <span
                    className="px-2 text-3xl truncate"
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
