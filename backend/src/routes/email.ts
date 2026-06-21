import express from "express";

import { getAllEmails, listEmails } from "../controllers/email";

const router = express.Router();

router.get("/", listEmails);
router.get("/all", getAllEmails);

export default router;
