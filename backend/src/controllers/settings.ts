import AllowedAdminEmail from "../models/allowedAdminEmail";
import User from "../models/user";
import { normalizeEmail } from "../util/authValidation";
import { requestBody } from "../util/requestBody";
import { toPublicUser } from "../util/userResponse";

import type { Request, Response } from "express";

function parseFullName(raw: unknown): { firstName: string; lastName: string } | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const space = trimmed.indexOf(" ");
  if (space === -1) {
    return { firstName: trimmed, lastName: trimmed };
  }
  const firstName = trimmed.slice(0, space).trim();
  const lastName = trimmed.slice(space + 1).trim();
  if (!firstName || !lastName) return null;
  return { firstName, lastName };
}

function parseEmailList(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  const emails: string[] = [];
  for (const item of raw) {
    const email = normalizeEmail(item);
    if (!email) return null;
    if (!emails.includes(email)) {
      emails.push(email);
    }
  }
  return emails;
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const userId = req.authUser?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const body = requestBody(req);
  const email = normalizeEmail(body.email);
  const names = parseFullName(body.fullName);

  if (!email || !names) {
    res.status(400).json({ error: "A valid full name and email are required." });
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (email !== user.email) {
    const taken = await User.findOne({ email });
    if (taken) {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }
    user.email = email;
  }

  user.firstName = names.firstName;
  user.lastName = names.lastName;
  await user.save();

  res.json({ user: toPublicUser(user), message: "Profile updated successfully." });
}

export async function listAllowedAdminEmails(req: Request, res: Response): Promise<void> {
  const rows = await AllowedAdminEmail.find().sort({ email: 1 }).lean();
  res.json({ emails: rows.map((row) => row.email) });
}

export async function updateAllowedAdminEmails(req: Request, res: Response): Promise<void> {
  const body = requestBody(req);
  const emails = parseEmailList(body.emails);

  if (!emails) {
    res.status(400).json({ error: "emails must be an array of valid email addresses." });
    return;
  }

  const currentUser = await User.findById(req.authUser?.userId);
  if (currentUser && !emails.includes(currentUser.email)) {
    emails.push(currentUser.email);
  }

  await AllowedAdminEmail.deleteMany({});
  if (emails.length > 0) {
    await AllowedAdminEmail.insertMany(emails.map((email) => ({ email })));
  }

  res.json({ emails, message: "Allowed admin emails updated." });
}
