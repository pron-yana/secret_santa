import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

const Session = mongoose.model('Session', sessionSchema);

export async function createSession(user) {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = new Session({
    sessionId,
    userId: user._id,
    expiresAt,
  });

  await session.save();
  return sessionId;
}

export async function verifySession(sessionId) {
  const session = await Session.findOne({ sessionId });

  if (!session) {
    return null;
  }

  if (session.expiresAt < Date.now()) {
    await Session.deleteOne({ sessionId });
    return null;
  }

  return session;
}

export async function logoutSession(sessionId) {
  const result = await Session.deleteOne({ sessionId });
  return result.deletedCount > 0;
}

function generateSessionId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}
