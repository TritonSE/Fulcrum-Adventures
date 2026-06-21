import mongoose from "mongoose";

let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectDb() {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  connectionPromise ??= mongoose.connect(process.env.MONGODB_URI).catch((error: unknown) => {
    connectionPromise = null;
    throw error;
  });

  return connectionPromise;
}
