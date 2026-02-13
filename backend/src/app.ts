/**
 * Defines server and middleware.
 */

import cors from "cors";
import express from "express";

import type { NextFunction, Request, Response } from "express";

const app = express();

// initializes Express to accept JSON in the request/response body
app.use(express.json());

// sets the "Access-Control-Allow-Origin" header on all responses to allow
// requests from the frontend, which has a different origin - see the following
// pages for more info:
// https://expressjs.com/en/resources/middleware/cors.html
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
  }),
);

/**
 * Error handler; all errors thrown by server are handled here.
 * Explicit typings required here because TypeScript cannot infer the argument types.
 */
app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
  // 500 is the "internal server error" error code, this will be our fallback
  const statusCode = 500;
  let errorMessage = "An error has occurred.";

  // check is necessary because anything can be thrown, type is not guaranteed
  if (error instanceof Error) {
    errorMessage = error.message;
  }

  res.status(statusCode).json({ error: errorMessage });
});

export default app;
