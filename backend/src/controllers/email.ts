
import EmailModel from "../models/email";

import type { RequestHandler } from "express";

type CreateEmailBody = {
  user_email: string;
};

export const createEmail: RequestHandler = async (req, res, next) => {
  // const validation_errors = validationResult(req);
  const { user_email } = req.body as CreateEmailBody;

  try {
    // validationErrorParser(validation_errors);

    const created_email_model = await EmailModel.create({
      email: user_email,
      dateSubscribed: Date.now(),
    });

    res.status(201).json(created_email_model);
  } catch (error) {
    next(error);
  }
};

export const existsEmail: RequestHandler = async (req, res, next) => {
  // const validation_errors = validationResult(req);
  const { req_email } = req.body as { req_email: string };
  try {
    // validationErrorParser(validation_errors);
    const user_email = await EmailModel.findOne({ email: req_email });
    res.status(200).json({ exists_email: !!user_email });
  } catch (error) {
    next(error);
  }
};
