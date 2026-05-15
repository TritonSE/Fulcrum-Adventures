export type Category =
  | "Opener"
  | "Icebreaker"
  | "Active"
  | "Connection"
  | "Debrief"
  | "Team Challenge";

export type EnergyLevel = "Low" | "Medium" | "High";

export type Environment = "Any Environment" | "Classroom" | "Field" | "Gym/MPR" | "Blacktop";

export type Range = {
  min: number;
  max: number;
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
};
