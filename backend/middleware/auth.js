import { getAuth } from "@clerk/express";

// Auth middleware: attaches user ID to request if authenticated
export const protect = (req, res, next) => {
  const auth = getAuth(req);
  const userId = auth?.userId || req.auth?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Not Authorized" });
  }

  req.user = { id: userId };
  next();
};
