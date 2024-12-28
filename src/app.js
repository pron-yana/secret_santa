import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './utils/db.js';
import { handleHtmlRoutes } from './routes/htmlRoutes.js';
import { handleApiRoutes } from './routes/apiRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

async function requestHandler(req, res) {
  try {
    if (req.url.startsWith('/api')) {
      const db = await connectDB();
      await handleApiRoutes(req, res, __dirname, db);
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

export async function startServer() {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to the database:', err);
    process.exit(1);
  }
}

startServer();

export async function stopServer() {
  return new Promise((resolve, reject) => {
    if (server) {
      server.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Server stopped');
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}
