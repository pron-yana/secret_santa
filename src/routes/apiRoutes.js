import { handleRegister } from '../controllers/registerHandler.js';
import { handleLogin } from '../controllers/loginHandler.js';
import { handleCreateEvent, handleGetEvent } from '../controllers/event.js';

export async function handleApiRoutes(req, res, baseDir) {
  const url = req.url;
  const method = req.method;

  if (method === 'POST' && url === '/api/register') {
    await handleRegister(req, res, baseDir);
  } else if (method === 'POST' && url === '/api/login') {
    await handleLogin(req, res, baseDir);
  } else if (method === 'POST' && url === '/api/create-event') {
    await handleCreateEvent(req, res, baseDir);
  } else if (method === 'GET' && url.startsWith('/api/event')) {
    await handleGetEvent(req, res, baseDir);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('API Endpoint Not Found');
  }
}
