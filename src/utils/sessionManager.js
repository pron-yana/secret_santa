import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sessionsFilePath = path.join(__dirname, '../../data/sessions.json');

export const sessions = new Map();

function ensureFileExists() {
  const dir = path.dirname(sessionsFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(sessionsFilePath)) {
    fs.writeFileSync(sessionsFilePath, JSON.stringify([]));
  }
}

function loadSessions() {
  ensureFileExists();
  const data = fs.readFileSync(sessionsFilePath, 'utf-8');
  const parsed = JSON.parse(data);
  parsed.forEach(([key, value]) => sessions.set(key, value));
}

function saveSessions() {
  ensureFileExists();
  const data = JSON.stringify(Array.from(sessions.entries()), null, 2);
  fs.writeFileSync(sessionsFilePath, data);
}

loadSessions();

setInterval(saveSessions, 10000);
process.on('exit', saveSessions);

export function createSession(user) {
  const sessionId = generateSessionId();
  sessions.set(sessionId, {
    userId: user.id,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  });
  saveSessions();
  return sessionId;
}

export function verifySession(sessionId) {
  if (sessions.has(sessionId)) {
    const session = sessions.get(sessionId);
    if (session.expiresAt < Date.now()) {
      sessions.delete(sessionId);
      saveSessions();
      return null;
    }
    return session;
  }
  return null;
}

export function logoutSession(sessionId) {
  if (sessions.has(sessionId)) {
    sessions.delete(sessionId);
    saveSessions();
    return true;
  }
  return false;
}

function generateSessionId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}
