import { model, Schema } from "mongoose";

import type { InferSchemaType } from "mongoose";

const allowedAdminEmailSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true },
);

type AllowedAdminEmail = InferSchemaType<typeof allowedAdminEmailSchema>;

export default model<AllowedAdminEmail>("AllowedAdminEmail", allowedAdminEmailSchema);
