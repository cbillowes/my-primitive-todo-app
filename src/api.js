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

const api = {
  getTodos,
};

export default api;
