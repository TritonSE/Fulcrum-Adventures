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
import { authenticate } from "../middleware/authenticate";
import { optionalAdmin } from "../middleware/optionalAdmin";
import { requireRole } from "../middleware/requireRole";
import { validateRequest } from "../middleware/validateRequest";
import {
  createActivityBody,
  listActivitiesQuery,
  updateActivityBody,
} from "../validators/activity";

const router = express.Router();
const adminOnly = [authenticate, requireRole("admin", "super_admin")];

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

router.get("/stats", adminOnly, getActivityStats);
router.get("/", optionalAdmin, listActivitiesQuery, validateRequest, listActivities);
router.get("/:id", optionalAdmin, getActivity);
router.post("/", adminOnly, createActivityBody, validateRequest, createActivity);
router.put("/:id", adminOnly, updateActivityBody, validateRequest, updateActivity);
router.patch("/:id/status", adminOnly, updateActivityStatus);
router.delete("/:id", adminOnly, deleteActivity);
router.post("/:id/media", adminOnly, upload.single("file"), uploadMedia);

export default router;
