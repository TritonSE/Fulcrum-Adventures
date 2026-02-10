export type Category =
  | "Opener"
  | "Icebreaker"
  | "Active"
  | "Connection"
  | "Debrief"
  | "Team Challenge";

export type EnergyLevel = "Low" | "Medium" | "High";

export type Environment = "Indoor" | "Outdoor" | "Both";

// Helper type for numeric ranges (filtering)
export type Range = {
  min: number;
  max: number;
};

// Structure for Prep tab content
export type PrepTab = {
  setup?: string[]; // Numbered list of setup instructions
  materials?: string[]; // UPDATED - Simple bullet points now
};

// Structure for Play tab content
export type PlayTab = {
  steps: PlayStep[];
};

export type PlayStep = {
  stepNumber: number;
  content: string;
};

// UPDATED
export type DebriefTab = {
  questions: string[];
};

// Structure for additional custom tabs
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

  // UPDATED - For Grade Level, 0 represents "K" (Kindergarten)
  gradeLevel: Range;
  groupSize: Range;
  duration: Range; // In minutes

  category: Category;
  description: string;
  energyLevel: EnergyLevel;
  environment: Environment;

  // UPDATED
  materials: string[];

  isSaved?: boolean;
  imageUrl?: string;
  hasTutorial?: boolean;

  objective?: string;

  // Facilitate tabs
  facilitate?: {
    prep?: PrepTab;
    play?: PlayTab;
    debrief?: DebriefTab; // UPDATED
    [tabName: string]: PrepTab | PlayTab | DebriefTab | CustomTab | undefined;
  };

  selTags?: string[];
  isCompleted?: boolean;
  isDownloaded?: boolean;
};
