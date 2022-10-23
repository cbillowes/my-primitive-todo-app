import React, { useEffect, useRef, useState } from 'react';
import api from './api';

const App = () => {
  const [todos, setTodos] = useState([]);
  const textbox = useRef();

  const setAndSortTodos = (items) => {
    setTodos(items.sort((x, y) => y.created - x.created));
  };

  useEffect(() => {
    const loadTodos = async () => {
      const data = await api.getTodos();
      setAndSortTodos(data);
    };
    loadTodos();
  }, []);

  const add = async () => {
    const task = textbox.current.value;
    if (task) {
      const result = await api.createTodo(task);
      if (result) {
        setAndSortTodos([...todos, result]);
        textbox.current.value = '';
      }
    }
  };

  const remove = async (id) => {
    const result = await api.deleteTodo(id);
    if (result) {
      setAndSortTodos(todos.filter((t) => t.id !== id));
    }
  };

  const toggle = async (todo) => {
    const updatedTodo = {
      ...todo,
      completed: !todo.completed,
    };
    const result = await api.updateTodo(updatedTodo);
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
