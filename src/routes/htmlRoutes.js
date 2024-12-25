import path from 'path';
import { protectRoute } from './protectedRoute.js';
import { serveFile } from '../utils/serveFile.js';
import { getFileContentType } from '../utils/getFileContentType.js';

export async function handleHtmlRoutes(req, res, baseDir) {
  const url = req.url;

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
      getFileContentType(url)
    );
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Page Not Found');
  }
}
