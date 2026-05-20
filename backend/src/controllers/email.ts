import Email from "../models/email";

import type { Request, Response } from "express";

export async function listEmails(req: Request, res: Response) {
  const sort = (req.query.sort as string) || "-createdAt";
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const [emails, total] = await Promise.all([
    Email.find().sort(sort).skip(skip).limit(limit),
    Email.countDocuments(),
  ]);

  res.json({
    emails,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit - 1e-10),
  });
}
