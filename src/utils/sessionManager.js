const sessions = new Map();

export function createSession(user) {
  const sessionId = generateSessionId();
  sessions.set(sessionId, { username: user.username, createdAt: Date.now() });
  return sessionId;
}

export function verifySession(sessionId) {
  return sessions.has(sessionId);
}

function generateSessionId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}
