import React, { useEffect, useState } from 'react';
import api from './api';

const App = () => {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const loadTodos = async () => {
      const data = await api.getTodos()
      setTodos(data);
    };
    loadTodos();
  }, []);

  return (
    <>
      {todos && todos.length === 0 && <div>There is nothing to do.</div>}
      {todos &&
        todos.length > 0 &&
        todos.map((todo) => {
          return <div key={todo.id}>{todo.id} | {todo.text}</div>;
        })}
    </>
  );
};

export default App;
