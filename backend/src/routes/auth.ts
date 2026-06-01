import express from "express";

import { getMe, registerProfile } from "../controllers/auth";
import {
  listAllowedAdminEmails,
  updateAllowedAdminEmails,
  updateProfile,
} from "../controllers/settings";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";

const router = express.Router();

router.get("/me", authenticate, getMe);
router.post("/register", authenticate, registerProfile);
router.patch("/me", authenticate, updateProfile);

router.get("/allowed-admins", authenticate, requireRole("super_admin"), listAllowedAdminEmails);
router.put("/allowed-admins", authenticate, requireRole("super_admin"), updateAllowedAdminEmails);

export default router;
