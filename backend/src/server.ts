/**
 * Initializes mongoose and express.
 */

import dotenv from "dotenv";
import mongoose from "mongoose";

import app from "./app";

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI. See backend/.env.example");
  process.exit(1);
}

if (!JWT_SECRET) {
  console.error(
    "Missing JWT_SECRET. Add a random string to backend/.env (e.g. openssl rand -base64 32)",
  );
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.info("Mongoose connected!");
    app.listen(PORT, () => {
      console.info(`Server running on ${PORT}.`);
    });
  })
  .catch(console.error);
