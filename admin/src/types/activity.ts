export type Category =
  | "Opener"
  | "Icebreaker"
  | "Active"
  | "Connection"
  | "Debrief"
  | "Team Challenge";

export type EnergyLevel = "Low" | "Medium" | "High";

export type Environment =
  | "Blacktop"
  | "Field"
  | "Classroom"
  | "Gym/MPR"
  | "Any Environment";

export type Setup = "None" | "Required";

export type Duration = "5-15 min" | "15-30 min" | "30+ min";

export type Status = "Draft" | "Published" | "Archived";

export type Range = {
  min: number;
  max: number;
};

export type GroupSizeRange = {
  anySize?: false;
  min: number;
  max: number;
};

export type GroupSizeAny = {
  anySize: true;
  min?: number;
  max?: number;
};

export type GroupSize = GroupSizeRange | GroupSizeAny;

export type FacilitateSection = {
  tabName: string;
  content: string;
};

export type Activity = {
  _id: string;
  title: string;
  overview: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  additionalMedia?: { type: "image"; url: string }[];
  category: Category[];
  gradeRange: Range;
  groupSize: GroupSize;
  duration: Duration;
  energyLevel: EnergyLevel;
  environment: Environment[];
  setup: Setup;
  objective?: string;
  facilitateSections: FacilitateSection[];
  materials: string[];
  selTags: string[];
  status: Status;
  createdAt: string;
  updatedAt: string;
};
