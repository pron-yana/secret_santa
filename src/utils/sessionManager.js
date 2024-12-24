const sessions = new Map();

export function createSession(user) {
  const sessionId = generateSessionId();
  sessions.set(sessionId, { userid: user.id, createdAt: Date.now() });
  return sessionId;
}

export function verifySession(sessionId) {
  if (sessions.has(sessionId)) {
    return sessions.get(sessionId);
  }
  return null;
}

function generateSessionId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}
