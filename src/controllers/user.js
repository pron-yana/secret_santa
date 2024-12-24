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

  const userId = verifySession(sessionId);
  const usersPath = path.join(baseDir, '../data', 'users.json');

  console.log(userId, ' userId');
  console.log(cookies, ' cookies');

  try {
    const usersData = await fs.readFile(usersPath, 'utf-8');
    const users = JSON.parse(usersData);
    const user = users.find((u) => u.id === userId);

    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User not found' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ username: user.username, events: user.events }));
  } catch (err) {
    console.error('Error fetching user info:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Server error' }));
  }
}
