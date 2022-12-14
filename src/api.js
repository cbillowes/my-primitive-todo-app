import { v4 as uuid } from 'uuid';

const throwError = (response, message) => {
  throw new Error({
    status: response.status,
    message,
    response,
  });
};

const respond = (response) => {
  if (response.status >= 500) {
    throwError(response, 'Internal Server Error');
  }
  if (response.status === 404) {
    throwError(response, 'Not Found');
  }
  if (response.status >= 400) {
    throwError(response, 'Bad Request');
  }
  return response.json();
};

const getTodos = async () => {
  const response = await fetch(`/.netlify/functions/getTodos`);
  return await respond(response);
};

const createTodo = async (text) => {
  const todo = {
    id: uuid(),
    text,
    created: new Date().getTime(),
  };
  const response = await fetch('/.netlify/functions/createTodo', {
    body: JSON.stringify(todo),
    method: 'POST',
  });
  const createdTodo = await respond(response);
  return {
    ...createdTodo,
    ...todo,
  };
};

const deleteTodo = async (id) => {
  const response = await fetch('/.netlify/functions/deleteTodo', {
    body: JSON.stringify({ id }),
    method: 'POST',
  });
  const deletedTodo = await respond(response);
  if (deletedTodo.deleted) {
    return id;
  }
  throw new Error(`Task ${id} was not deleted.`);
};

const updateTodo = async (task) => {
  const todo = {
    ...task,
    modified: new Date().getTime(),
  };
  const response = await fetch('/.netlify/functions/updateTodo', {
    body: JSON.stringify(todo),
    method: 'POST',
  });
  const updatedTodo = await respond(response);
  return {
    ...updatedTodo,
    ...todo,
  };
};

const api = {
  getTodos,
  createTodo,
  deleteTodo,
  updateTodo,
};

export default api;
