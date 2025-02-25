const fs = require('fs');
const path = require('path');
const counterFilePath = path.join(__dirname, 'counter.json');

exports.handler = async () => {
  const counter = require(counterFilePath);
  counter.value += 1;

  // Update the counter value in the JSON file
  fs.writeFileSync(counterFilePath, JSON.stringify(counter));

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Counter incremented' }),
  };
};