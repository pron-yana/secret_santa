import { parseCookies } from '../utils/parseCookies.js';
import { verifySession } from '../utils/sessionManager.js';
import Event from '../models/event.js';
import User from '../models/user.js';

export async function handleCreateEvent(req, res) {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const { name, recommendations, userId } = JSON.parse(body);

      if (!name || !userId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `Назва свята є обов'язковою` }));
        return;
      }

      const user = await User.findById(userId);

      if (!user) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Користувача не знайдено' }));
        return;
      }

      const newEvent = new Event({
        name,
        recommendations,
        completed: false,
        ownerId: userId,
        participants: [],
        pairs: [],
      });

      await newEvent.save();

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

export async function handleGetEvent(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const eventId = url.searchParams.get('id');

  if (!eventId) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: `ID івенту є обов'язковим` }));
    return;
  }

  try {
    const event = await Event.findById(eventId);

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

export async function handleParticipateEvent(req, res) {
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
          JSON.stringify({ message: `ID івенту та побажання є обов'язковими` })
        );
        return;
      }

      const event = await Event.findById(eventId);

      if (!event) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Івент не знайдено' }));
        return;
      }

      const alreadyParticipating = event.participants.some(
        (p) => p.userId === userId
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
      await event.save();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Ви успішно приєдналися до свята' }));
    } catch (err) {
      console.error('Помилка обробки участі:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Сталася помилка сервера' }));
    }
  });
}

export async function handleGetEvents(req, res) {
  try {
    const cookies = parseCookies(req);
    const sessionId = cookies.sessionId;

    if (!sessionId) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Unauthorized' }));
      return;
    }

    const sessionData = await verifySession(sessionId);

    const userId = sessionData.userId;
    const events = await Event.find({
      $or: [{ ownerId: userId }, { 'participants.userId': userId }],
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(events));
  } catch (err) {
    console.error('Error fetching events:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Server error while fetching events' }));
  }
}

export async function handleFinishEvent(req, res) {
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

      const event = await Event.findById(eventId);

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

      const participants = event.participants;

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
      await event.save();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Свято успішно завершено', pairs }));
    } catch (err) {
      console.error('Помилка завершення свята:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Сталася помилка сервера' }));
    }
  });
}
