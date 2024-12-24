import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleHtmlRoutes } from './routes/htmlRoutes.js';
import { handleApiRoutes } from './routes/apiRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

async function requestHandler(req, res) {
  try {
    if (req.url.startsWith('/api')) {
      await handleApiRoutes(req, res, __dirname);
    } else {
      await handleHtmlRoutes(req, res, __dirname);
    }
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server Error');
    console.error(err);
  }
}

const server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
