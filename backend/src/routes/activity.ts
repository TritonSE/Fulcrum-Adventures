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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(?:jpg|jpeg|png|gif|webp)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (jpg, jpeg, png, gif, webp)"));
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
