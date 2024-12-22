import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleRoutes } from './routes/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

async function requestHandler(req, res) {
  try {
    await handleRoutes(req, res, __dirname);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server Error');
  }
}

const server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
