import express from "express";

import { listEmails } from "../controllers/email";

const router = express.Router();

router.get("/", listEmails);

export default router;
