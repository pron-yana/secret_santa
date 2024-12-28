import {
  handleLogin,
  handleLogout,
  handleRegister,
} from '../controllers/auth.js';
import { protectRoute } from './protectedRoute.js';
import {
  handleCreateEvent,
  handleGetEvent,
  handleParticipateEvent,
  handleGetEvents,
  handleFinishEvent,
  handleDeleteEvent,
} from '../controllers/event.js';

import {
  handleGetCurrentUser,
  handleGetUserById,
} from '../controllers/user.js';

export async function handleApiRoutes(req, res, baseDir) {
  const url = req.url;
  const method = req.method;

  if (method === 'POST' && url === '/api/register') {
    await handleRegister(req, res, baseDir);
  } else if (method === 'POST' && url === '/api/login') {
    await handleLogin(req, res, baseDir);
  } else if (method === 'POST' && url === '/api/logout') {
    await handleLogout(req, res);
  } else if (method === 'POST' && url === '/api/create-event') {
    await protectRoute(req, res, async () => {
      await handleCreateEvent(req, res, baseDir);
    });
  } else if (method === 'POST' && url.startsWith('/api/event/participate')) {
    await protectRoute(req, res, async () => {
      await handleParticipateEvent(req, res, baseDir);
    });
  } else if (method === 'GET' && url.startsWith('/api/event/list')) {
    await protectRoute(req, res, async () => {
      await handleGetEvents(req, res, baseDir);
    });
  } else if (method === 'POST' && url.startsWith('/api/event/finish')) {
    await protectRoute(req, res, async () => {
      await handleFinishEvent(req, res, baseDir);
    });
  } else if (method === 'GET' && url.startsWith('/api/event')) {
    await protectRoute(req, res, async () => {
      await handleGetEvent(req, res, baseDir);
    });
  } else if (method === 'DELETE' && url.startsWith('/api/event')) {
    await protectRoute(req, res, async () => {
      await handleDeleteEvent(req, res, baseDir);
    });
  } else if (method === 'GET' && url.startsWith('/api/user/current')) {
    await protectRoute(req, res, async () => {
      await handleGetCurrentUser(req, res, baseDir);
    });
  } else if (method === 'GET' && url.startsWith('/api/user')) {
    await protectRoute(req, res, async () => {
      await handleGetUserById(req, res, baseDir);
    });
    if (req.url === '/api/health' && req.method === 'GET') {
      await protectRoute(req, res, async () => {
        await handleHealthCheck(req, res);
      });
      return;
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('API Endpoint Not Found');
  }
}

async function handleHealthCheck(_, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'OK' }));
}
