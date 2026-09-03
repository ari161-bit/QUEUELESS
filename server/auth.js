import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-insecure-secret-change-me";

if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  console.warn(
    "[queueless] WARNING: JWT_SECRET is not set. Using an insecure default. Set JWT_SECRET in production."
  );
}

export function signBusinessToken(business) {
  return jwt.sign({ businessId: business.id }, JWT_SECRET, { expiresIn: "7d" });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Not authenticated." });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.businessId = payload.businessId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session." });
  }
}
