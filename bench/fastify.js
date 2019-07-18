const fastify = require("fastify")({ logger: false });

const routes = require("./routes");
const PORT = process.env.PORT || 3000;

routes.forEach(path =>
  fastify.get(path, async (request, reply) => "Hello World!")
);

const start = async () => {
  try {
    await fastify.listen(PORT);
  } catch (err) {
    process.exit(1);
  }
};
start();
