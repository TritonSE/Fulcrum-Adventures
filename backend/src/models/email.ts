import { model, Schema } from "mongoose";

import type { InferSchemaType } from "mongoose";

const emailSchema = new Schema(
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

type Email = InferSchemaType<typeof emailSchema>;

export default model<Email>("Email", emailSchema);
