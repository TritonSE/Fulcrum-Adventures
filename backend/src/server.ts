/**
 * Initializes mongoose and express.
 */

import "dotenv/config";
import mongoose from "mongoose";

import app from "./app";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const MONGODB_URI = process.env.MONGODB_URI as string;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.info("Mongoose connected!");
    app.listen(PORT, () => {
      console.info(`Server running on ${PORT}.`);
    });
  })
  .catch(console.error);
