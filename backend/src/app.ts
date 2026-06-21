import path from "node:path";

import cors from "cors";
import express from "express";

import { connectDb } from "./db";
import activityRoutes from "./routes/activity";
import authRoutes from "./routes/auth";
import emailRoutes from "./routes/email";

import type { NextFunction, Request, Response } from "express";

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  ...(process.env.FRONTEND_ORIGINS ?? "").split(","),
]
  .map((origin) => origin?.trim())
  .filter((origin): origin is string => Boolean(origin));

const adminPreviewOriginPattern =
  /^https:\/\/fulcrum-admin(?:-git-[a-z0-9-]+|-[a-z0-9]+)-philip-chens-projects\.vercel\.app$/;

function isAllowedOrigin(origin: string): boolean {
  return allowedOrigins.includes(origin) || adminPreviewOriginPattern.test(origin);
}

const app = express();

app.use(express.json());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
  }),
);

if (!process.env.VERCEL) {
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
}

app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await connectDb();
    next();
  } catch (error) {
    next(error);
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/emails", emailRoutes);

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  let statusCode = 500;
  let errorMessage = "An error has occurred.";

  if (error instanceof Error) {
    const status = (error as { status?: number }).status;
    if (typeof status === "number") {
      statusCode = status;
    } else if (error.name === "ValidationError") {
      statusCode = 400;
    } else if (error.name === "CastError") {
      statusCode = 400;
      errorMessage = "Invalid ID format";
    }
    errorMessage = error.message;
  }

  res.status(statusCode).json({ error: errorMessage });
});

export default app;
