/**
 * Initializes mongoose and express.
 */

import "dotenv/config";
import mongoose from "mongoose";

import app from "./app";
import { connectDb } from "./db";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

connectDb()
  .then(() => {
    console.info("Mongoose connected!");
    app.listen(PORT, () => {
      console.info(`Server running on ${PORT}.`);
    });
  })
  .catch(console.error);
