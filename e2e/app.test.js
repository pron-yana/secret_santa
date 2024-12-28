import { ClientFunction, RequestLogger } from 'testcafe';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const TEST_USER_NAME = process.env.TEST_USER_NAME;
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;
const TEST_USER_ID = process.env.TEST_USER_ID;

const logger = RequestLogger(
  { url: 'http://localhost:3000/api/login', method: 'post' },
  {
    logRequestBody: true,
    logResponseBody: true,
    logRequestHeaders: true,
    logResponseHeaders: true,
  }
);

const setCookie = ClientFunction((name, value) => {
  document.cookie = `${name}=${value}; path=/`;
});

fixture('E2E Tests with Real API Login')
  .page('http://localhost:3000/login')
  .requestHooks(logger);

let sessionCookie;
let createdEventId;

test('Login and Set Session Cookie', async (t) => {
  const loginResponse = await t.request({
    url: 'http://localhost:3000/api/login',
    method: 'POST',
    body: {
      username: TEST_USER_NAME,
      password: TEST_USER_PASSWORD,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  await t
    .expect(loginResponse.status)
    .eql(200, 'Login API response should be 200');

  const cookies = loginResponse.headers['set-cookie'];
  sessionCookie = cookies.find((cookie) => cookie.startsWith('sessionId='));
  const sessionId = sessionCookie.split(';')[0].split('=')[1];

  t.ctx.sessionId = sessionId;

  await setCookie('sessionId', sessionId);
});

test.before(async (t) => {
  await setCookie('sessionId', t.ctx.sessionId);
})('Create an Event', async (t) => {
  const createEventResponse = await t.request({
    url: 'http://localhost:3000/api/create-event',
    method: 'POST',
    body: {
      name: 'Test Event',
      recommendations: 'Bring your own gift!',
      userId: TEST_USER_ID,
    },
    headers: {
      'Content-Type': 'application/json',
      Cookie: sessionCookie,
    },
  });

  await t
    .expect(createEventResponse.status)
    .eql(201, 'Event creation should return 201');
  const responseBody = createEventResponse.body;
  createdEventId = responseBody.event._id;
  await t.expect(responseBody.message).eql('Свято успішно створено');
  await t.expect(responseBody.event.name).eql('Test Event');
});

test.before(async (t) => {
  await setCookie('sessionId', t.ctx.sessionId);
})('Participate in Event', async (t) => {
  const participateResponse = await t.request({
    url: 'http://localhost:3000/api/event/participate',
    method: 'POST',
    body: {
      userId: TEST_USER_ID,
      eventId: createdEventId,
      wishes: 'A book or a board game',
    },
    headers: {
      'Content-Type': 'application/json',
      Cookie: sessionCookie,
    },
  });

  await t
    .expect(participateResponse.status)
    .eql(200, 'Participation should return 200');
  const responseBody = participateResponse.body;
  await t.expect(responseBody.message).eql('Ви успішно приєдналися до свята');
});

test.before(async (t) => {
  await setCookie('sessionId', t.ctx.sessionId);
})('Owner cannot finish event with insufficient participants', async (t) => {
  const finishEventResponse = await t.request({
    url: 'http://localhost:3000/api/event/finish',
    method: 'POST',
    body: {
      eventId: createdEventId,
    },
    headers: {
      'Content-Type': 'application/json',
      Cookie: sessionCookie,
    },
  });

  await t
    .expect(finishEventResponse.status)
    .eql(400, 'Should return 400 due to insufficient participants');
  const responseBody = finishEventResponse.body;
  await t
    .expect(responseBody.message)
    .eql(
      'Недостатньо учасників для завершення свята',
      'Error message should match'
    );
});

test.before(async (t) => {
  await setCookie('sessionId', t.ctx.sessionId);
})('Delete the created test event', async (t) => {
  const response = await fetch(
    `http://localhost:3000/api/event?id=${createdEventId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
    }
  );

  const responseData = await response.json();

  await t.expect(response.ok).ok('The DELETE request should succeed');
  await t.expect(responseData.message).eql('Event deleted successfully');

  const getResponse = await fetch(
    `http://localhost:3000/api/event?id=${createdEventId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
    }
  );

  const getResponseData = await getResponse.json();
  await t
    .expect(getResponse.status)
    .eql(404, 'The event should no longer exist');
  await t.expect(getResponseData.message).eql('Івент не знайдено');
});

test('User can log out after deleting an event', async (t) => {
  const logoutResponse = await t.request({
    url: 'http://localhost:3000/api/logout',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: sessionCookie,
    },
  });

  await t
    .expect(logoutResponse.status)
    .eql(200, 'Logout request should succeed');
  await t
    .expect(logoutResponse.body.message)
    .eql('Logout successful', 'Logout message should confirm success');
});
