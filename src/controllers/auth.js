import User from '../models/user.js';
import { v4 as uuidv4 } from 'uuid';
import { createSession, logoutSession } from '../utils/sessionManager.js';
import { parseCookies } from '../utils/parseCookies.js';

export async function handleLogin(req, res) {
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

      const user = await User.findOne({ username, password });
      if (!user) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({ message: `Невірне ім'я користувача або пароль` })
        );
        return;
      }

      const sessionId = await createSession(user);

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
    const result = await logoutSession(sessionId);
    if (result) {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Set-Cookie': 'sessionId=; HttpOnly; Path=/; Max-Age=0',
      });
      res.end(JSON.stringify({ message: 'Logout successful' }));
    } else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Session not found' }));
    }
  } else {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'No session found to log out' }));
  }
}

export async function handleRegister(req, res) {
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

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({ message: 'Користувач з таким іменем вже існує' })
        );
        return;
      }

      const newUser = new User({
        username,
        password,
        id: uuidv4(),
        events: [],
      });
      await newUser.save();

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Користувач успішно зареєстрований' }));
    } catch (err) {
      console.error('Помилка реєстрації:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Сталася помилка сервера' }));
    }
  });
}
