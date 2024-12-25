import User from '../models/user.js';
import { v4 as uuidv4 } from 'uuid';

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
