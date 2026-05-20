import { model, Schema } from "mongoose";

import type { UserRole } from "../constants/userRoles";
import type { InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    hashedPassword: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["super_admin", "admin"],
      required: true,
    },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: import("mongoose").Types.ObjectId;
  role: UserRole;
};

export default model<UserDocument>("User", userSchema);
