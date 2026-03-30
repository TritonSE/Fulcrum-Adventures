export type Category =
  | "Opener"
  | "Icebreaker"
  | "Active"
  | "Connection"
  | "Debrief"
  | "Team Challenge";

export type EnergyLevel = "Low" | "Medium" | "High";

export type Environment =
  | "Large Open Space"
  | "Outdoor"
  | "Any"
  | "Small Space"
  | "Virtual";

export type Setup = "None" | "Required";

export type Duration = "5-15 min" | "15-30 min" | "30+ min";

export type Status = "Draft" | "Published" | "Archived";

export type Range = {
  min: number;
  max: number;
};

export type FacilitateSection = {
  tabName: string;
  content: string;
};

export type Activity = {
  _id: string;
  title: string;
  overview: string;
  thumbnailUrl?: string;
  additionalMedia?: { type: "image" | "video"; url: string }[];
  category: Category;
  gradeRange: Range;
  groupSize: { min: number; max: number; anySize: boolean };
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
