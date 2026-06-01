import express from "express";

import { forgotPassword, getMe, login, register, resetPassword } from "../controllers/auth";
import {
  changePassword,
  listAllowedAdminEmails,
  updateAllowedAdminEmails,
  updateProfile,
} from "../controllers/settings";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/me", authenticate, getMe);
router.patch("/me", authenticate, updateProfile);
router.patch("/me/password", authenticate, changePassword);

router.get(
  "/allowed-admins",
  authenticate,
  requireRole("super_admin"),
  listAllowedAdminEmails,
);
router.put(
  "/allowed-admins",
  authenticate,
  requireRole("super_admin"),
  updateAllowedAdminEmails,
);

export default router;
