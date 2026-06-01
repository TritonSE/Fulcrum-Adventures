import crypto from "node:crypto";

import User from "../models/user";
import AllowedAdminEmail from "../models/allowedAdminEmail";
import { normalizeEmail, parseName, parsePassword, parseResetToken } from "../util/authValidation";
import { signAccessToken } from "../util/jwt";
import { hashPassword, verifyPassword } from "../util/password";
import { requestBody } from "../util/requestBody";
import { toPublicUser } from "../util/userResponse";

import type { UserDocument } from "../models/user";
import type { Request, Response } from "express";

const LOGIN_ERROR = "Incorrect email or password.";
const FORGOT_PASSWORD_MESSAGE =
  "If an account exists for this email, password reset instructions have been sent.";

function buildAuthResponse(user: UserDocument) {
  const publicUser = toPublicUser(user);
  const token = signAccessToken({
    userId: publicUser.id,
    email: publicUser.email,
    role: publicUser.role,
  });
  return { token, user: publicUser };
}

export async function login(req: Request, res: Response): Promise<void> {
  const body = requestBody(req);
  const email = normalizeEmail(body.email);
  const password = parsePassword(body.password);

  if (!email || !password) {
    res.status(401).json({ error: LOGIN_ERROR });
    return;
  }

  const user = await User.findOne({ email }).select("+hashedPassword");
  if (!user?.hashedPassword) {
    res.status(401).json({ error: LOGIN_ERROR });
    return;
  }

  const valid = await verifyPassword(password, user.hashedPassword);
  if (!valid) {
    res.status(401).json({ error: LOGIN_ERROR });
    return;
  }

  res.json(buildAuthResponse(user));
}

export async function register(req: Request, res: Response): Promise<void> {
  const body = requestBody(req);
  const email = normalizeEmail(body.email);
  const password = parsePassword(body.password);
  const firstName = parseName(body.firstName);
  const lastName = parseName(body.lastName);

  if (!email || !password || !firstName || !lastName) {
    res.status(400).json({
      error:
        "firstName, lastName, a valid email, and a password (more than 6 characters) are required.",
    });
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ error: "An account with this email already exists." });
    return;
  }

  const userCount = await User.countDocuments();
  if (userCount > 0) {
    const allowed = await AllowedAdminEmail.findOne({ email });
    if (!allowed) {
      res.status(403).json({
        error: "This email is not authorized to create an account. Contact your administrator.",
      });
      return;
    }
  }

  const role = userCount === 0 ? "super_admin" : "admin";

  const hashedPassword = await hashPassword(password);
  const user = await User.create({
    firstName,
    lastName,
    email,
    hashedPassword,
    role,
  });

  if (role === "super_admin") {
    await AllowedAdminEmail.findOneAndUpdate(
      { email },
      { email },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  res.status(201).json(buildAuthResponse(user));
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const body = requestBody(req);
  const email = normalizeEmail(body.email);

  if (!email) {
    res.status(400).json({ error: "A valid email is required." });
    return;
  }

  const user = await User.findOne({ email }).select("+passwordResetToken +passwordResetExpires");

  if (user) {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetBase = process.env.PASSWORD_RESET_URL ?? "http://localhost:5173/reset-password";
    const resetLink = `${resetBase}?token=${resetToken}`;

    if (process.env.NODE_ENV !== "production") {
      console.info(`[auth] Password reset link for ${email}: ${resetLink}`);
    }
    // TODO: send resetLink to user.email via transactional email provider
  }

  res.json({ message: FORGOT_PASSWORD_MESSAGE });
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const body = requestBody(req);
  const token = parseResetToken(body.token);
  const password = parsePassword(body.password);

  if (!token || !password) {
    res.status(400).json({
      error: "A valid reset token and password (more than 6 characters) are required.",
    });
    return;
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select("+hashedPassword +passwordResetToken +passwordResetExpires");

  if (!user) {
    res.status(400).json({ error: "Invalid or expired reset token." });
    return;
  }

  user.hashedPassword = await hashPassword(password);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({ message: "Password has been reset successfully." });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const userId = req.authUser?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  res.json({ user: toPublicUser(user) });
}
