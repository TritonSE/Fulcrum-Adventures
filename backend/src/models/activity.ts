import { model, Schema } from "mongoose";

import type { InferSchemaType } from "mongoose";

const additionalMediaSchema = new Schema(
  {
    type: { type: String, enum: ["image"], required: true, default: "image" },
    url: { type: String, required: true },
  },
  { _id: false },
);

const facilitateSectionSchema = new Schema(
  {
    tabName: { type: String, required: true },
    content: { type: String, required: true },
  },
  { _id: false },
);

type GroupSizeDoc = { anySize?: boolean };

const groupSizeSchema = new Schema(
  {
    min: {
      type: Number,
      required: function groupSizeMinRequired(this: GroupSizeDoc) {
        return !this.anySize;
      },
    },
    max: {
      type: Number,
      required: function groupSizeMaxRequired(this: GroupSizeDoc) {
        return !this.anySize;
      },
    },
    anySize: { type: Boolean, default: false },
  },
  { _id: false },
);

const activitySchema = new Schema(
  {
    title: { type: String, required: true },
    overview: { type: String, required: true },
    thumbnailUrl: { type: String },
    videoUrl: { type: String },
    additionalMedia: [additionalMediaSchema],
    category: {
      type: [String],
      enum: ["Opener", "Icebreaker", "Active", "Connection", "Debrief", "Team Challenge"],
      required: true,
      validate: {
        validator: (v: string[]) => v.length >= 1 && v.length <= 3,
        message: "category must have between 1 and 3 items.",
      },
    },
    gradeRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    groupSize: { type: groupSizeSchema, required: true },
    duration: {
      type: String,
      enum: ["5-15 min", "15-30 min", "30+ min"],
      required: true,
    },
    energyLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },
    environment: [
      {
        type: String,
        enum: ["Blacktop", "Field", "Classroom", "Gym/MPR", "Any Environment"],
      },
    ],
    setup: {
      type: String,
      enum: ["None", "Required"],
      default: "None",
    },
    objective: { type: String },
    facilitateSections: [facilitateSectionSchema],
    materials: { type: [String], default: [] },
    selTags: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Draft",
    },
  },
  { timestamps: true },
);

type Activity = InferSchemaType<typeof activitySchema>;

export default model<Activity>("Activity", activitySchema);
