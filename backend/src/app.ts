import path from "node:path";

import cors from "cors";
import express from "express";

import { authenticate } from "./middleware/authenticate";
import activityRoutes from "./routes/activity";
import authRoutes from "./routes/auth";

import type { NextFunction, Request, Response } from "express";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
  }),
);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/activities", authenticate, activityRoutes);

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
