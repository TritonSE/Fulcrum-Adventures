/**
 * Initializes mongoose and express.
 */

import dotenv from "dotenv";

import app from "./app";
import { connectDb } from "./db";

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

connectDb()
  .then(() => {
    console.info("Mongoose connected!");
    app.listen(PORT, () => {
      console.info(`Server running on ${PORT}.`);
    });
  })
  .catch(console.error);
