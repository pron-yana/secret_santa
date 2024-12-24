import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function handleCreateEvent(req, res, baseDir) {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const { name, recommendations, username } = JSON.parse(body);

      if (!name || !username) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            message: "Назва свята та ім'я користувача є обов'язковими",
          })
        );
        return;
      }

      const dataPath = path.join(baseDir, '../data');
      const eventsPath = path.join(dataPath, 'events.json');
      const usersPath = path.join(dataPath, 'users.json');

      try {
        await fs.mkdir(dataPath, { recursive: true });
      } catch (err) {
        console.error('Помилка створення папки:', err);
      }

      let events = [];
      try {
        const eventsData = await fs.readFile(eventsPath, 'utf-8');
        events = JSON.parse(eventsData);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err;
        }
      }

      let users = [];
      try {
        const usersData = await fs.readFile(usersPath, 'utf-8');
        users = JSON.parse(usersData);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err;
        }
      }

      const user = users.find((u) => u.username === username);
      if (!user) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Користувача не знайдено' }));
        return;
      }

      const id = uuidv4();
      const newEvent = {
        id,
        name,
        recommendations,
        completed: false,
        ownerUsername: username,
      };
      events.push(newEvent);

      user.events = user.events || [];
      user.events.push(newEvent.id);

      await fs.writeFile(eventsPath, JSON.stringify(events, null, 2), 'utf-8');
      await fs.writeFile(usersPath, JSON.stringify(users, null, 2), 'utf-8');

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({ message: 'Свято успішно створено', event: newEvent })
      );
    } catch (err) {
      console.error('Помилка створення свята:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Сталася помилка сервера' }));
    }
  });
}

export async function handleGetEvent(req, res, baseDir) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const eventId = url.searchParams.get('id');

  if (!eventId) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: "ID івенту є обов'язковим" }));
    return;
  }

  const eventsPath = path.join(baseDir, '../data', 'events.json');

  try {
    const eventsData = await fs.readFile(eventsPath, 'utf-8');
    const events = JSON.parse(eventsData);

    const event = events.find((e) => e.id === eventId);

    if (!event) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Івент не знайдено' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(event));
  } catch (err) {
    console.error('Помилка отримання івенту:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Сталася помилка сервера' }));
  }
}
