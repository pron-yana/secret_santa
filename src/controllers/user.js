import { verifySession } from '../utils/sessionManager.js';
import fs from 'fs/promises';
import path from 'path';
import { parseCookies } from '../utils/parseCookies.js';

export async function handleGetCurrentUser(req, res, baseDir) {
  const cookies = parseCookies(req);
  const sessionId = cookies.sessionId;

  if (!sessionId || !verifySession(sessionId)) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Unauthorized' }));
    return;
  }

  const session = verifySession(sessionId);
  const usersPath = path.join(baseDir, '../data', 'users.json');

  try {
    const usersData = await fs.readFile(usersPath, 'utf-8');
    const users = JSON.parse(usersData);

    const user = users.find((u) => u.id === session.userId);
    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User not found' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(user));
  } catch (err) {
    console.error('Error fetching user info:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Server error' }));
  }
}

export async function handleGetUserById(req, res, baseDir) {
  const urlParts = req.url.split('/');
  const userId = urlParts[urlParts.length - 1]; // Extract the user ID from the URL

  if (!userId) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({ message: 'Ідентифікатор користувача є обов’язковим' })
    );
    return;
  }

  const usersPath = path.join(baseDir, '../data', 'users.json');

  try {
    const usersData = await fs.readFile(usersPath, 'utf-8');
    const users = JSON.parse(usersData);

    const user = users.find((u) => u.id === userId);

    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Користувача не знайдено' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(user));
  } catch (err) {
    console.error('Помилка завантаження користувача:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Сталася помилка сервера' }));
  }
}
