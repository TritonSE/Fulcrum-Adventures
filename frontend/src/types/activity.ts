export type Category =
  | "Opener"
  | "Icebreaker"
  | "Active"
  | "Connection"
  | "Debrief"
  | "Team Challenge";

export type EnergyLevel = "Low" | "Medium" | "High";

export type Environment = "Indoor" | "Outdoor" | "Both";

export type Material = {
  name: string;
  isChecked: boolean; // Checked states stay (until unchecked), even if user did not save, complete, or download the activity card
};

// Structure for Prep tab content
export type PrepTab = {
  setup?: string[]; // Numbered list of setup instructions
  materials?: Material[]; // Checklist of materials
};

// Structure for Play tab content
export type PlayTab = {
  steps: PlayStep[]; // Array of step objects (Step 1, Step 2, etc.)
};

export type PlayStep = {
  stepNumber: number; // 1, 2, 3, etc.
  content: string; // Paragraph text for the step
};

// Structure for additional custom tabs (Safety, Variations, Pro-Tip, etc.)
export type CustomTab = {
  sections: CustomSection[]; // Array of sections
};

export type CustomSection = {
  header?: string; // Optional header (can be omitted for just text)
  content: string; // Paragraph text
};

export type Activity = {
  id: string;
  title: string;
  gradeLevel: string; // e.g., "K-12", "6-8", "9-12"
  groupSize: string; // e.g., "5-20", "10-30", "Any"
  duration: string; // e.g., "5-15 min", "15-30 min"
  category: Category;
  description: string; // One sentence overview of the activity
  energyLevel: EnergyLevel;
  environment: Environment;
  materials: Material[]; // Props/materials needed for the activity
  isSaved?: boolean;
  imageUrl?: string;
  hasTutorial?: boolean;

  // Optional fields for full activity page (not needed for cards, but part of shared types)
  objective?: string;

  // Facilitate tabs
  // Default tabs: Prep and Play (only display if content exists)
  // Additional tabs (Safety, Variations, Pro-Tip, etc.) - max 6 tabs total
  facilitate?: {
    prep?: PrepTab;
    play?: PlayTab;
    // Additional custom tabs indexed by name (e.g., "Safety", "Variations", "Pro-Tip")
    [tabName: string]: PrepTab | PlayTab | CustomTab | undefined;
  };

  selTags?: string[]; // SEL Opportunity Tags
  isCompleted?: boolean;
  isDownloaded?: boolean;
  isHistory?: boolean;
  isPlaylist?: boolean;
};
