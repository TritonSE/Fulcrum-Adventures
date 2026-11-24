import express from "express";

import { getAllEmails, listEmails, subscribeEmail } from "../controllers/email";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";

const router = express.Router();

router.post("/", subscribeEmail);
router.get("/", authenticate, requireRole("admin", "super_admin"), listEmails);
router.get("/all", authenticate, requireRole("admin", "super_admin"), getAllEmails);

export default router;
