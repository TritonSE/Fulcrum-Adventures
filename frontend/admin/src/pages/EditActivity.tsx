import React from "react";

import { ActivityEditor } from "./ActivityEditor";

type EditActivityProps = {
  activityId?: string;
  onCancel?: () => void;
};

export const EditActivity: React.FC<EditActivityProps> = (props) => (
  <ActivityEditor mode="edit" {...props} />
);
