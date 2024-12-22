import fs from 'fs/promises';
import path from 'path';

export async function handleRoutes(req, res, baseDir) {
  const url = req.url;

  if (req.method === 'GET') {
    if (url === '/') {
      await serveFile(
        res,
        path.join(baseDir, 'public', 'index.html'),
        'text/html'
      );
    } else if (url === '/login') {
      await serveFile(
        res,
        path.join(baseDir, 'public', 'login.html'),
        'text/html'
      );
    } else if (url === '/register') {
      await serveFile(
        res,
        path.join(baseDir, 'public', 'register.html'),
        'text/html'
      );
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Page Not Found');
    }
  } else if (req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        if (url === '/register') {
          const { username, password } = JSON.parse(body);
          const usersPath = path.join(baseDir, 'data', 'users.json');

          let users = [];
          try {
            const usersData = await fs.readFile(usersPath);
            users = JSON.parse(usersData);
          } catch (err) {
            console.log(err);
          }

          users.push({ username, password });
          await fs.writeFile(usersPath, JSON.stringify(users, null, 2));

          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'User registered successfully' }));
        } else if (url === '/login') {
          const { username, password } = JSON.parse(body);
          const usersPath = path.join(baseDir, 'data', 'users.json');

          try {
            const usersData = await fs.readFile(usersPath);
            const users = JSON.parse(usersData);
            const user = users.find(
              (u) => u.username === username && u.password === password
            );

            if (user) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ message: 'Login successful' }));
            } else {
              res.writeHead(401, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ message: 'Invalid credentials' }));
            }
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Server Error');
            console.log(err);
          }
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Endpoint Not Found');
        }
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error');
        console.log(err);
      }
    });
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
  }
}

async function serveFile(res, filePath, contentType) {
  try {
    const data = await fs.readFile(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server Error');
    console.log(err);
  }
}
