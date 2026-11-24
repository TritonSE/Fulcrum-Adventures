import Email from "../models/email";
import { normalizeEmail } from "../util/authValidation";
import { requestBody } from "../util/requestBody";

import type { Request, Response } from "express";

// Accept public signups without exposing whether an address is already subscribed.
export async function subscribeEmail(req: Request, res: Response): Promise<void> {
  const email = normalizeEmail(requestBody(req).email);
  if (!email || email.length > 254) {
    res.status(400).json({ error: "Please enter a valid email address." });
    return;
  }

  try {
    await Email.updateOne({ email }, { $setOnInsert: { email } }, { upsert: true });
  } catch (error) {
    // Concurrent signups can hit the unique index after another request inserts the email.
    if (!(typeof error === "object" && error !== null && "code" in error && error.code === 11000)) {
      res.status(503).json({ error: "Unable to sign up right now. Please try again." });
      return;
    }
  }

  res.json({ message: "You're on the list!" });
}

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

export async function getAllEmails(req: Request, res: Response) {
  const EMAILS_PER_PAGE = 10;

  const [emails, total] = await Promise.all([
    Email.find().sort("-createdAt"),
    Email.countDocuments(),
  ]);

  res.json({
    emails,
    total,
    totalPages: Math.ceil(total / EMAILS_PER_PAGE - 1e-10),
  });
}
