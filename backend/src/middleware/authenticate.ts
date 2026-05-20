import { verifyAccessToken } from "../util/jwt";

import type { NextFunction, Request, Response } from "express";

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = header.slice(7).trim();
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    req.authUser = verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}
