export type Category =
  | "Opener"
  | "Icebreaker"
  | "Active"
  | "Connection"
  | "Debrief"
  | "Team Challenge";

export type EnergyLevel = "Low" | "Medium" | "High";

export type Environment = "Any Environment" | "Classroom" | "Field" | "Gym/MPR" | "Blacktop";

export type Setup = "None" | "Required";

export type ApiDuration = "5-15 min" | "15-30 min" | "30+ min";

export type ActivityStatus = "Draft" | "Published" | "Archived";

export type Range = {
  min: number;
  max: number;
};

export type ApiGroupSize = Range & {
  anySize: boolean;
};

export type ApiAdditionalMedia = {
  type: "image" | "video";
  url: string;
};

export type ApiFacilitateSection = {
  tabName: string;
  content: string;
};

export type ApiActivity = {
  _id: string;
  title: string;
  overview: string;
  thumbnailUrl?: string;
  additionalMedia?: ApiAdditionalMedia[];
  category: Category[];
  gradeRange: Range;
  groupSize: ApiGroupSize;
  duration: ApiDuration;
  energyLevel: EnergyLevel;
  environment: Environment[];
  setup: Setup;
  objective?: string;
  facilitateSections: ApiFacilitateSection[];
  materials: string[];
  selTags: string[];
  status: ActivityStatus;
  createdAt: string;
  updatedAt: string;
};

export type PrepTab = {
  setup?: string[];
  materials?: string[];
};

export type PlayTab = {
  steps: PlayStep[];
};

export type PlayStep = {
  stepNumber: number;
  content: string;
};

export type DebriefTab = {
  questions: string[];
};

// Structure for additional custom tabs (Safety, Variations, Pro-Tip, etc.)
export type CustomTab = {
  sections: CustomSection[];
};

export type CustomSection = {
  header?: string;
  content: string;
};

export type Activity = {
  id: string;
  title: string;

  /** Range endpoints; 0 means Kindergarten ("K"). */
  gradeLevel: Range;
  groupSize: Range;
  duration: Range; // In minutes
  category?: Category;
  categories?: Category[];
  description: string;
  energyLevel: EnergyLevel;
  environment: Environment;
  materials: string[];
  isSaved?: boolean;
  imageUrl?: string;
  hasTutorial?: boolean;

  objective?: string;

  facilitate?: {
    prep?: PrepTab;
    play?: PlayTab;
    debrief?: DebriefTab;
    [tabName: string]: PrepTab | PlayTab | DebriefTab | CustomTab | undefined;
  };

  selTags?: string[];
  isCompleted?: boolean;
  isDownloaded?: boolean;
  isHistory?: boolean;
  isPlaylist?: boolean;
  lastViewedAt?: number;
  videoUrl?: string;
};
