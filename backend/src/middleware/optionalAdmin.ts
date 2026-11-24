import { authenticate } from "./authenticate";
import { requireRole } from "./requireRole";

import type { NextFunction, Request, Response } from "express";

const requireAdmin = requireRole("admin", "super_admin");

// Public reads need no login; supplied credentials must belong to an active admin.
export function optionalAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.headers.authorization === undefined) {
    next();
    return;
  }

  void authenticate(req, res, () => requireAdmin(req, res, next));
}
