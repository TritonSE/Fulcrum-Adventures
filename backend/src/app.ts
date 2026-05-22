import path from "node:path";

import cors from "cors";
import express from "express";

import { connectDb } from "./db";
import activityRoutes from "./routes/activity";

import type { NextFunction, Request, Response } from "express";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
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

app.use("/api/activities", activityRoutes);

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  let statusCode = 500;
  let errorMessage = "An error has occurred.";

  if (error instanceof Error) {
    if (error.name === "ValidationError") {
      statusCode = 400;
      errorMessage = error.message;
    } else if (error.name === "CastError") {
      statusCode = 400;
      errorMessage = "Invalid ID format";
    } else {
      errorMessage = error.message;
    }
  }

  res.status(statusCode).json({ error: errorMessage });
});

export default app;
