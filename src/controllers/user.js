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

    const user = users.find((u) => u.id === session.userid);
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
