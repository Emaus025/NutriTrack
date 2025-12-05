const jsonServer = require('json-server');

const server = jsonServer.create();
const router = jsonServer.router('server/db.json');
const middlewares = jsonServer.defaults();

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

server.use(middlewares);

// Endpoint para exponer el color de despliegue (blue/green) a frontend
server.get('/deployColor', (req, res) => {
  const color = (process.env.THEME_COLOR || 'green').toLowerCase();
  res.json({ color });
});

// Rutas de json-server
server.use(router);

server.listen(PORT, HOST, () => {
  console.log(`JSON Server corriendo en http://${HOST}:${PORT}`);
});