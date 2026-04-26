import { Router } from "express";

import { createEmail, existsEmail } from "../controllers/email";

const router = Router();

router.post("/", createEmail);
router.post("/exists", existsEmail);

export default router;
