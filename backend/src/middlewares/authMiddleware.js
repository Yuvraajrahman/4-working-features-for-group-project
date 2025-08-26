// Demo mode: bypass token verification entirely
export function verifyToken(req, res, next) {
  req.admin = { username: "demo", email: "demo@example.com" };
  return next();
}