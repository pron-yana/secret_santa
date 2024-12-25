import fs from 'fs/promises';
import path from 'path';
import { createSession, verifySession } from '../utils/sessionManager.js';
import { createDataFile } from '../utils/createDataFile.js';
import { parseCookies } from '../utils/parseCookies.js';
import { sessions } from '../utils/sessionManager.js';

export async function handleLogin(req, res, baseDir) {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const { username, password } = JSON.parse(body);

      if (!username || !password) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({ message: `Ім'я користувача та пароль обов'язкові` })
        );
        return;
      }

      const dataPath = path.join(baseDir, '../data');
      const usersPath = path.join(dataPath, 'users.json');

      await createDataFile(dataPath);

      let users = [];
      try {
        const usersData = await fs.readFile(usersPath, 'utf-8');
        users = JSON.parse(usersData);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err;
        }
      }

      const user = users.find(
        (u) => u.username === username && u.password === password
      );

      if (!user) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({ message: `Невірне ім'я користувача або пароль` })
        );
        return;
      }

      const sessionId = createSession(user);

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Set-Cookie': `sessionId=${sessionId}; HttpOnly; Path=/`,
      });
      res.end(JSON.stringify({ message: 'Вхід успішний' }));
    } catch (err) {
      console.error('Помилка входу:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Сталася помилка сервера' }));
    }
  });
}

export async function handleLogout(req, res) {
  const cookies = parseCookies(req);
  const sessionId = cookies.sessionId;

  if (sessionId) {
    sessions.delete(sessionId);
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Set-Cookie': 'sessionId=; HttpOnly; Path=/; Max-Age=0',
    });
    res.end(JSON.stringify({ message: 'Logout successful' }));
  } else {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'No session found to log out' }));
  }
}
