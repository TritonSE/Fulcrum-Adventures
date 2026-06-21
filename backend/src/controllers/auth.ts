import crypto from "node:crypto";

import AllowedAdminEmail from "../models/allowedAdminEmail";
import User from "../models/user";
import { normalizeEmail, parseName } from "../util/authValidation";
import { hashPassword } from "../util/password";
import { requestBody } from "../util/requestBody";
import { toPublicUser } from "../util/userResponse";

import type { Request, Response } from "express";

export async function getMe(req: Request, res: Response): Promise<void> {
  const authUser = req.authUser;
  if (!authUser) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const email = authUser.email.toLowerCase();
  const user = await User.findOne({ email });
  if (user && user.isActive !== false) {
    res.json({ user: toPublicUser(user) });
    return;
  }

  res.status(403).json({
    error: "This account is not authorized for admin access.",
  });
}

/** Creates the MongoDB admin profile after Firebase sign-up (allowed-email rules apply). */
export async function registerProfile(req: Request, res: Response): Promise<void> {
  const authUser = req.authUser;
  if (!authUser) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const body = requestBody(req);
  const firstName = parseName(body.firstName);
  const lastName = parseName(body.lastName);
  const email = normalizeEmail(authUser.email) ?? normalizeEmail(body.email);

  if (!email || !firstName || !lastName) {
    res.status(400).json({
      error: "firstName, lastName, and a valid email are required.",
    });
    return;
  }

  const allowed = await AllowedAdminEmail.findOne({ email });
  if (!allowed) {
    res.status(403).json({
      error: "This email is not authorized to create an account. Contact your administrator.",
    });
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.isActive !== false) {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }

    existing.firstName = firstName;
    existing.lastName = lastName;
    existing.isActive = true;
    await existing.save();

    res.status(200).json({ user: toPublicUser(existing) });
    return;
  }

  const userCount = await User.countDocuments();
  const role = userCount === 0 ? "super_admin" : "admin";
  const placeholderPassword = await hashPassword(crypto.randomBytes(32).toString("hex"));

  const user = await User.create({
    firstName,
    lastName,
    email,
    hashedPassword: placeholderPassword,
    role,
  });

  if (role === "super_admin") {
    await AllowedAdminEmail.findOneAndUpdate(
      { email },
      { email },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  res.status(201).json({ user: toPublicUser(user) });
}
