import fs from "node:fs";
import path from "node:path";

import express from "express";
import multer from "multer";

import {
  createActivity,
  deleteActivity,
  getActivity,
  getActivityStats,
  listActivities,
  updateActivity,
  updateActivityStatus,
  uploadMedia,
} from "../controllers/activity";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads", "activities");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(?:jpg|jpeg|png|gif|webp|mp4|webm|mov)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed"));
    }
  },
});

router.get("/stats", getActivityStats);
router.get("/", listActivities);
router.get("/:id", getActivity);
router.post("/", createActivity);
router.put("/:id", updateActivity);
router.patch("/:id/status", updateActivityStatus);
router.delete("/:id", deleteActivity);
router.post("/:id/media", upload.single("file"), uploadMedia);

export default router;
