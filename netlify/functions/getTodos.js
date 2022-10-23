const { getCollection } = require('./astraClient');

exports.handler = async (event, context) => {
  try {
    const todos = await getCollection();
    try {
      const res = await todos.find({});
      return {
        statusCode: 200,
        body: JSON.stringify(Object.values(res.data)),
      };
    } catch (e) {
      const code = e.toString().indexOf("Request failed with status code 404") > -1
        ? 404
        : 400;
      return {
        statusCode: code,
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
