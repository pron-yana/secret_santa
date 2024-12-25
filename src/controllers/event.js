import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { parseCookies } from '../utils/parseCookies.js';
import { verifySession } from '../utils/sessionManager.js';

export async function handleCreateEvent(req, res, baseDir) {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk.toString();
  });
  req.on('end', async () => {
    try {
      const { name, recommendations, userId } = JSON.parse(body);

      if (!name || !userId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            message: `Назва свята є обов'язковими`,
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

      const user = users.find((u) => u.id === userId);
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
        ownerId: userId,
        participants: [],
        pairs: [],
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
    res.end(JSON.stringify({ message: `ID івенту є обов'язковим` }));
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

export async function handleParticipateEvent(req, res, baseDir) {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const { userId, eventId, wishes } = JSON.parse(body);
      if (!userId || !eventId || !wishes) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            message: `ID івенту та побажання є обов'язковими`,
          })
        );
        return;
      }

      const eventsPath = path.join(baseDir, '../data', 'events.json');

      let events = [];
      try {
        const eventsData = await fs.readFile(eventsPath, 'utf-8');
        events = JSON.parse(eventsData);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err;
        }
      }

      const event = events.find((e) => e.id === eventId);

      if (!event) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Івент не знайдено' }));
        return;
      }

      event.participants = event.participants || [];
      const alreadyParticipating = event.participants.some(
        (participant) => participant.userId === userId
      );

      if (alreadyParticipating) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            message: 'Користувач вже бере участь у цьому святі',
          })
        );
        return;
      }

      event.participants.push({ userId, wishes });

      await fs.writeFile(eventsPath, JSON.stringify(events, null, 2), 'utf-8');

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Ви успішно приєдналися до свята' }));
    } catch (err) {
      console.error('Помилка обробки участі:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Сталася помилка сервера' }));
    }
  });
}

export async function handleGetEvents(req, res, baseDir) {
  const eventsPath = path.join(baseDir, '../data', 'events.json');

  try {
    const cookies = parseCookies(req);
    const sessionId = cookies.sessionId;

    if (!sessionId) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Unauthorized' }));
      return;
    }

    const sessionData = verifySession(sessionId);

    if (!sessionData) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Unauthorized' }));
      return;
    }

    const userId = sessionData.userid;

    const eventsData = await fs.readFile(eventsPath, 'utf-8');
    const events = JSON.parse(eventsData);

    const filteredEvents = events.filter(
      (event) =>
        event.ownerId === userId ||
        event.participants.some((p) => p.userId === userId)
    );

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(filteredEvents));
  } catch (err) {
    console.error('Error fetching events:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Server error while fetching events' }));
  }
}

export async function handleFinishEvent(req, res, baseDir) {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const { eventId } = JSON.parse(body);

      if (!eventId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({ message: 'Ідентифікатор свята є обов’язковим' })
        );
        return;
      }

      const eventsPath = path.join(baseDir, '../data', 'events.json');

      let events = [];
      try {
        const eventsData = await fs.readFile(eventsPath, 'utf-8');
        events = JSON.parse(eventsData);
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
      }

      const event = events.find((e) => e.id === eventId);

      if (!event) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Свято не знайдено' }));
        return;
      }

      if (event.completed) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Свято вже завершено' }));
        return;
      }

      const participants = event.participants || [];

      if (participants.length < 2) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            message: 'Недостатньо учасників для завершення свята',
          })
        );
        return;
      }

      const shuffled = participants.sort(() => Math.random() - 0.5);
      const pairs = [];

      for (let i = 0; i < shuffled.length; i++) {
        const giver = shuffled[i];
        const receiver = shuffled[(i + 1) % shuffled.length];
        pairs.push({ giver: giver.userId, receiver: receiver.userId });
      }

      event.completed = true;
      event.pairs = pairs;

      await fs.writeFile(eventsPath, JSON.stringify(events, null, 2), 'utf-8');

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Свято успішно завершено', pairs }));
    } catch (err) {
      console.error('Помилка завершення свята:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Сталася помилка сервера' }));
    }
  });
}
