import { validationResult } from "express-validator";

import type { NextFunction, Request, Response } from "express";

function firstValidationMessage(req: Request): string {
  const [firstError] = validationResult(req).array({ onlyFirstError: true });
  if (firstError && "msg" in firstError && typeof firstError.msg === "string") {
    return firstError.msg;
  }
  return "Invalid request.";
}

export function validateRequest(req: Request, res: Response, next: NextFunction): void {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    res.status(400).json({ error: firstValidationMessage(req) });
    return;
  }
  next();
}
