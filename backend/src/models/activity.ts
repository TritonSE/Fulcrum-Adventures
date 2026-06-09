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
    tabName: { type: String },
    content: { type: String },
  },
  { _id: false },
);

type GroupSizeDoc = { anySize?: boolean };
type GradeRangeDoc = { min?: number; max?: number };
type ActivityValidationDoc = {
  status?: string;
  get?: (path: string) => unknown;
  getUpdate?: () => Record<string, unknown> | undefined;
};

function getValidationStatus(this: ActivityValidationDoc): string | undefined {
  if (this.status) return this.status;

  if (typeof this.get === "function") {
    const queryStatus = this.get("status");
    if (typeof queryStatus === "string") return queryStatus;
  }

  if (typeof this.getUpdate === "function") {
    const update = this.getUpdate();
    const directStatus = update?.status;
    if (typeof directStatus === "string") return directStatus;

    const setStatus = (update?.$set as { status?: unknown } | undefined)?.status;
    if (typeof setStatus === "string") return setStatus;
  }

  return undefined;
}

function isDraftActivity(this: ActivityValidationDoc): boolean {
  return getValidationStatus.call(this) === "Draft";
}

function requiresCompleteActivity(this: ActivityValidationDoc): boolean {
  return !isDraftActivity.call(this);
}

const groupSizeSchema = new Schema(
  {
    min: { type: Number },
    max: { type: Number },
    anySize: { type: Boolean, default: false },
  },
  { _id: false },
);

const gradeRangeSchema = new Schema(
  {
    min: { type: Number },
    max: { type: Number },
  },
  { _id: false },
);

const activitySchema = new Schema(
  {
    title: { type: String, required: requiresCompleteActivity },
    overview: { type: String, required: requiresCompleteActivity },
    thumbnailUrl: { type: String },
    videoUrl: { type: String },
    additionalMedia: [additionalMediaSchema],
    category: {
      type: [String],
      enum: ["Opener", "Icebreaker", "Active", "Connection", "Debrief", "Team Challenge"],
      required: requiresCompleteActivity,
      validate: {
        validator(this: ActivityValidationDoc, value: string[] | undefined) {
          if (!value || value.length === 0) {
            return isDraftActivity.call(this);
          }
          return value.length >= 1 && value.length <= 3;
        },
        message: "category must have between 1 and 3 items.",
      },
    },
    gradeRange: {
      type: gradeRangeSchema,
      required: requiresCompleteActivity,
      validate: {
        validator(this: ActivityValidationDoc, value: GradeRangeDoc | undefined) {
          if (!value || (value.min === undefined && value.max === undefined)) {
            return isDraftActivity.call(this);
          }

          if (!Number.isInteger(value.min) || !Number.isInteger(value.max)) {
            return false;
          }

          const min = value.min as number;
          const max = value.max as number;
          return min >= 0 && min <= 12 && max >= 0 && max <= 12 && min <= max;
        },
        message: "gradeRange must include min and max between 0 and 12.",
      },
    },
    groupSize: {
      type: groupSizeSchema,
      required: requiresCompleteActivity,
      validate: {
        validator(
          this: ActivityValidationDoc,
          value: (GroupSizeDoc & { min?: number; max?: number }) | undefined,
        ) {
          if (isDraftActivity.call(this)) {
            return true;
          }

          if (
            !value ||
            (value.min === undefined && value.max === undefined && value.anySize !== true)
          ) {
            return false;
          }

          if (value.anySize === true) {
            return true;
          }

          if (!Number.isInteger(value.min) || !Number.isInteger(value.max)) {
            return false;
          }

          const min = value.min as number;
          const max = value.max as number;
          return min >= 1 && max >= min;
        },
        message: "groupSize must include a valid min and max, or set anySize to true.",
      },
    },
    duration: {
      type: String,
      enum: ["5-15 min", "15-30 min", "30+ min"],
      required: requiresCompleteActivity,
    },
    energyLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: requiresCompleteActivity,
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
