import { randomUUID } from "node:crypto";
import path from "node:path";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

const REQUIRED_ENV_VARS = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
  "FIREBASE_STORAGE_BUCKET",
];

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing Firebase Storage environment variable: ${name}`);
  }
  return value;
}

function getStorageBucketName(): string {
  const rawBucket = getRequiredEnv("FIREBASE_STORAGE_BUCKET");
  const bucketName = rawBucket
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/^gs:\/\//, "")
    .replace(/\/+$/, "");

  if (!bucketName) {
    throw new Error("FIREBASE_STORAGE_BUCKET must be a valid bucket name.");
  }

  return bucketName;
}

function getBucket() {
  const missingVars = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);
  if (missingVars.length > 0) {
    throw new Error(`Missing Firebase Storage environment variables: ${missingVars.join(", ")}`);
  }

  const storageBucket = getStorageBucketName();
  const app =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: getRequiredEnv("FIREBASE_PROJECT_ID"),
        clientEmail: getRequiredEnv("FIREBASE_CLIENT_EMAIL"),
        privateKey: getRequiredEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
      }),
      storageBucket,
    });

  return getStorage(app).bucket(storageBucket);
}

function getStoragePath(activityId: string, originalName: string): string {
  const extension = path.extname(originalName).toLowerCase();
  const baseName = path
    .basename(originalName, extension)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const filename = `${Date.now()}-${randomUUID()}-${baseName || "media"}${extension}`;
  return `activities/${activityId}/${filename}`;
}

export async function uploadActivityMedia(file: Express.Multer.File, activityId: string) {
  if (!file.buffer || file.buffer.length === 0) {
    throw new Error("Uploaded file is empty");
  }

  const bucket = getBucket();
  const storagePath = getStoragePath(activityId, file.originalname);
  const downloadToken = randomUUID();

  await bucket.file(storagePath).save(file.buffer, {
    contentType: file.mimetype,
    metadata: {
      metadata: {
        firebaseStorageDownloadTokens: downloadToken,
      },
    },
    resumable: false,
  });

  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
    storagePath,
  )}?alt=media&token=${downloadToken}`;
}
