export type Activity = {
  id: string;
  title: string;
  description: string;
  images?: string[];
  videos?: string[];
  location?: string;
  date?: string;
  duration?: string;
  difficulty?: string;
  category?: string;
  gradeLevel?: string;
  participants?: string;
  objective?: string;
  tags?: string[];
  selOpportunities?: string[];
  facilitate?: {
    prep?: {
      setup?: string;
      materials?: string[];
    };
    play?: string;
    safety?: string;
    variations?: string;
  };
};

export const mockActivities: Activity[] = [
  {
    id: "1",
    title: "Bull Ring - Ice Cream Challenge",
    description:
      "A team-based coordination activity that requires students to work together to transport an object using shared control.",
    images: ["bull-ring-activity-card.jpg", "bull-ring-setup-diagram.jpg"],
    videos: ["bull-ring-instructional-video.mp4"],
    location: "Indoor or Outdoor",
    date: "2024-01-15",
    duration: "5-15 min",
    difficulty: "Intermediate",
    category: "Team Challenge",
    gradeLevel: "K-12",
    participants: "5-20",
    objective: "Move the ice cream cone to 'the kid' without dropping it.",
    tags: ["Outdoor", "Props"],
    selOpportunities: [
      "Accountability",
      "Collaboration",
      "Resilience",
      "Confidence",
      "Sportsmanship",
    ],
    facilitate: {
      prep: {
        setup:
          "Set up Bull Ring so that all the strings are laid out. For a more challenging variation, place the orange discs out as an obstacle course.",
        materials: ["Bull Ring Set"],
      },
    },
  },
  {
    id: "2",
    title: "Lorem Ipsum",
    description: "One sentence description of activity overview.",
    images: ["trust-fall-activity-card.jpg"],
    videos: ["trust-fall-instructional-video.mp4", "trust-fall-safety-guide.mp4"],
    location: "Indoor or Outdoor",
    date: "2026-01-16",
    duration: "x minutes",
    difficulty: "Medium",
    category: "Test Category",
    gradeLevel: "6-12",
    participants: "8-16",
    objective: "Some objective",
    tags: ["Indoor", "Outdoor"],
    selOpportunities: ["Trust", "Communication", "Support"],
  },
  {
    id: "3",
    title: "Lorem Ipsum",
    description: "One sentence description of activity overview.",
    images: ["spider-web-activity-card.jpg", "spider-web-setup-guide.jpg"],
    videos: ["spider-web-instructional-video.mp4"],
    location: "Outdoor",
    date: "2026-01-16",
    duration: "45-60 minutes",
    difficulty: "Advanced",
    category: "Problem Solving",
    gradeLevel: "9-12",
    participants: "10-24",
    objective: "Some objective",
    tags: ["Outdoor", "Props", "Physical"],
    selOpportunities: ["Problem Solving", "Planning", "Cooperation"],
  },
];
