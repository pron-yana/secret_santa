import fs from 'fs/promises';
import path from 'path';
import { handleRegister } from '../controllers/registerHandler.js';
import { handleLogin, protectRoute } from '../controllers/loginHandler.js';
import { handleCreateEvent } from '../controllers/event.js';

export async function handleRoutes(req, res, baseDir) {
  const url = req.url;
  const method = req.method;

  try {
    if (method === 'GET') {
      if (url === '/') {
        await protectRoute(req, res, async () => {
          await serveFile(
            res,
            path.join(baseDir, '../public', 'index.html'),
            'text/html'
          );
        });
      } else if (url === '/login') {
        await serveFile(
          res,
          path.join(baseDir, '../public', 'login.html'),
          'text/html'
        );
      } else if (url === '/register') {
        await serveFile(
          res,
          path.join(baseDir, '../public', 'register.html'),
          'text/html'
        );
      } else if (url.startsWith('/event')) {
        await protectRoute(req, res, async () => {
          await serveFile(
            res,
            path.join(baseDir, '../public', 'event.html'),
            'text/html'
          );
        });
      } else if (url.startsWith('/create-event')) {
        await protectRoute(req, res, async () => {
          await serveFile(
            res,
            path.join(baseDir, '../public', 'createEvent.html'),
            'text/html'
          );
        });
      } else if (
        url.startsWith('/styles') ||
        url.startsWith('/scripts') ||
        url.startsWith('/images')
      ) {
        await serveFile(
          res,
          path.join(baseDir, '../public', url),
          getContentType(url)
        );
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Page Not Found');
      }
    } else if (method === 'POST') {
      if (url === '/register') {
        await handleRegister(req, res, baseDir);
      } else if (url === '/login') {
        await handleLogin(req, res, baseDir);
      } else if (url === '/create-event') {
        await handleCreateEvent(req, res, baseDir);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Endpoint Not Found');
      }
    } else {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end('Method Not Allowed');
    }
  } catch (err) {
    console.error('Error handling route:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
}

function getContentType(url) {
  if (url.endsWith('.css')) return 'text/css';
  if (url.endsWith('.js')) return 'application/javascript';
  if (url.endsWith('.png')) return 'image/png';
  if (url.endsWith('.jpg') || url.endsWith('.jpeg')) return 'image/jpeg';
  if (url.endsWith('.gif')) return 'image/gif';
  return 'application/octet-stream';
}

async function serveFile(res, filePath, contentType) {
  try {
    const data = await fs.readFile(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch (err) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File Not Found');
    console.error(`Error reading file: ${filePath}`, err);
  }
}
