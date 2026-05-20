import express from "express";

import { forgotPassword, getMe, login, register, resetPassword } from "../controllers/auth";
import { authenticate } from "../middleware/authenticate";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/me", authenticate, getMe);

export default router;
