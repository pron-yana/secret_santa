import fs from 'fs/promises';
import path from 'path';

import { v4 as uuidv4 } from 'uuid';

import { createDataFile } from '../utils/createDataFile.js';

export async function handleRegister(req, res, baseDir) {
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
        const usersData = (await fs.readFile(usersPath, 'utf-8')) || [];
        users = JSON.parse(usersData);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err;
        }
      }

      if (users.some((user) => user.username === username)) {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({ message: 'Користувач з таким іменем вже існує' })
        );
        return;
      }

      users.push({ username, password, id: uuidv4() });
      await fs.writeFile(usersPath, JSON.stringify(users, null, 2), 'utf-8');

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Користувач успішно зареєстрований' }));
    } catch (err) {
      console.error('Помилка реєстрації:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Сталася помилка сервера' }));
    }
  });
}
