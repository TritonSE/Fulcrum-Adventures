import { model, Schema } from "mongoose";

import type { InferSchemaType } from "mongoose";

const activitySchema = new Schema({});
type Activity = InferSchemaType<typeof activitySchema>;

export default model<Activity>("Activity", activitySchema);
