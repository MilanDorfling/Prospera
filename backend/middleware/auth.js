// Reusable lightweight token extraction & auth middleware
// Supports tokens passed via:
// 1. Authorization: Bearer <token>
// 2. Query param: ?userToken=...
// 3. Body field: { userToken: "..." }
// Falls back gracefully; does NOT validate existence in DB (anonymous model).
// Future enhancement: verify token against persisted User collection.

function extractToken(req) {
  try {
    const auth = req.headers.authorization || '';
    if (auth.startsWith('Bearer ')) return auth.slice(7);
    if (req.query && req.query.userToken) return req.query.userToken;
    if (req.body && req.body.userToken) return req.body.userToken;
    return null;
  } catch (_) {
    return null;
  }
}

function requireUserToken(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(400).json({ error: 'userToken required' });
  }
  req.userToken = token;
  next();
}

module.exports = { extractToken, requireUserToken };
