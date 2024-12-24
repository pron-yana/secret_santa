export function parseCookies(req) {
  const rawCookies = req.headers.cookie || '';
  const cookies = {};

  rawCookies.split(';').forEach((cookie) => {
    const [key, value] = cookie.split('=').map((c) => c.trim());
    if (key && value) cookies[key] = value;
  });

  return cookies;
}
