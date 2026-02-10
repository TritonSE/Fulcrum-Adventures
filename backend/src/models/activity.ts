import { model, Schema } from "mongoose";

import type { InferSchemaType } from "mongoose";

const activitySchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  objective: { type: String },
  imageUrl: { type: String },
  hasTutorial: { type: Boolean },
  isCompleted: { type: Boolean },
  isDownloaded: { type: Boolean },

  category: {
    type: String,
    enum: ["Opener", "Icebreaker", "Active", "Connection", "Debrief", "Team Challenge"],
  },
  energyLevel: {
    type: String,
    enum: ["Low", "Medium", "High"],
    required: true,
  },
  environment: {
    type: String,
    enum: ["Indoor", "Outdoor", "Both"],
    required: true,
  },
  gradeLevel: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  },

  groupSize: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  },
  duration: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  },
  materials: { type: [String] },
  selTags: { type: [String] },
  facilitate: {
    prep: {
      setup: { type: [String] },
      materials: { type: [String] },
    },
    play: {
      steps: [
        {
          stepNumber: { type: Number },
          content: { type: String },
        },
      ],
    },
    debrief: {
      questions: { type: [String] },
    },
  },
});
type Activity = InferSchemaType<typeof activitySchema>;

export default model<Activity>("Activity", activitySchema);
