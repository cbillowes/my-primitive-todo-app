import { v4 as uuid } from 'uuid';

const wrapError = (response, message) => {
  return {
    status: response.status,
    message,
    response,
  };
};

const respond = (response) => {
  if (response.status >= 500) {
    throw wrapError(response, 'Internal Server Error');
  }
  if (response.status === 404) {
    throw wrapError(response, 'Not Found');
  }
  if (response.status >= 400) {
    throw wrapError(response, 'Bad Request');
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

const api = {
  getTodos,
  createTodo,
};

export default api;
