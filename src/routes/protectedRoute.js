import { parseCookies } from '../utils/parseCookies.js';
import { verifySession } from '../utils/sessionManager.js';

export async function protectRoute(req, res, next) {
  const cookies = parseCookies(req);
  const sessionId = cookies.sessionId;

  if (!sessionId || !verifySession(sessionId)) {
    res.writeHead(302, { Location: '/login' });
    res.end();
    return;
  }
  await next();
}
