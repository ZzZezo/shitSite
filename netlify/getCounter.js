const counter = require('./counter.json');  // Assuming you store counter value in a JSON file.

exports.handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({ counter: counter.value }),
  };
};