import { verifySession } from '../utils/sessionManager.js';
import User from '../models/user.js';
import { parseCookies } from '../utils/parseCookies.js';

export async function handleGetCurrentUser(req, res) {
  const cookies = parseCookies(req);
  const sessionId = cookies.sessionId;

  if (!sessionId) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Unauthorized' }));
    return;
  }

  const session = await verifySession(sessionId);
  if (!session) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Unauthorized' }));
    return;
  }

  try {
    const user = await User.findById(session.userId);

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

export async function handleGetUserById(req, res) {
  const urlParts = req.url.split('/');
  const userId = urlParts[urlParts.length - 1];

  if (!userId) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({ message: 'Ідентифікатор користувача є обов’язковим' })
    );
    return;
  }

  try {
    const user = await User.findById(userId);

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
