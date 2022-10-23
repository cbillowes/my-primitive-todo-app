const { getCollection } = require('./astraClient');

exports.handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    const todos = await getCollection();
    try {
      const res = await todos.delete(body.id);
      return {
        statusCode: 200,
        body: JSON.stringify(res),
      };
    } catch (e) {
      return {
        statusCode: 400,
        body: JSON.stringify(e.message),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error.message),
    };
  }
};
