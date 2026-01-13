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
  facilitate?: {
    // Customizable tabs like "Prep", "Play", "Safety", "Variations", "Pro-Tip", "Reflection", etc.
    // Content stored as strings (Markdown/HTML) to support rich formatting (h1, h2, bold, lists, etc.)
    // Use a Markdown renderer component to display with proper formatting
    [tabName: string]: string;
  };
  setup?: string[]; // Step-by-step instructions
  selTags?: string[]; // SEL Opportunity Tags
  isCompleted?: boolean;
  isDownloaded?: boolean;
};