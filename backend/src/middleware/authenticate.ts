import User from "../models/user";
import { verifyFirebaseIdToken } from "../util/firebaseAdmin";

import type { NextFunction, Request, Response } from "express";

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
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
    const firebaseUser = await verifyFirebaseIdToken(token);
    const email = firebaseUser.email.toLowerCase();
    const dbUser = await User.findOne({ email });

    req.authUser = {
      userId: dbUser ? String(dbUser._id) : firebaseUser.userId,
      email: firebaseUser.email,
      role: dbUser?.role ?? firebaseUser.role,
    };
    next();
  } catch (error) {
    console.error("Firebase authentication failed:", error);
    res.status(401).json({ error: "Unauthorized" });
  }
}
