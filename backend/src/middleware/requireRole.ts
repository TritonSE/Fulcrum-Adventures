import type { UserRole } from "../constants/userRoles";
import type { NextFunction, Request, Response } from "express";

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.authUser) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (req.authUser.isActive === false) {
      res.status(403).json({ error: "This account is not authorized for admin access." });
      return;
    }
    if (!roles.includes(req.authUser.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}
