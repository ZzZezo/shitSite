// netlify/functions/hello.ts
exports.handler = async () => {
  console.log("TEST: Function has been triggered!");
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello, Netlify Functions!" })
  };
};
//# sourceMappingURL=hello.js.map
