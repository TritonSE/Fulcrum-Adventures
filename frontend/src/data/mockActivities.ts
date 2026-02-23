// src/data/mockActivities.ts
import type { Activity } from "../types/activity";

export const mockActivities: Activity[] = [
  {
    id: "1",
    title: "Bull Ring - Ice Cream Challenge",
    // Was "K-12"
    gradeLevel: { min: 0, max: 12 },
    // Was "5-20"
    groupSize: { min: 5, max: 20 },
    // Was "5-15 min"
    duration: { min: 5, max: 15 },
    category: "Team Challenge",
    description:
      "A team-based coordination activity that requires students to work together to transport an object using shared control.",
    energyLevel: "Medium",
    environment: "Outdoor",
    isSaved: false,
    hasTutorial: true,
    imageUrl: "https://via.placeholder.com/400x300",
    objective: "Move the ice cream cone to 'the kid' without dropping it.",
    // Changed to simple strings
    materials: ["Bull Ring Set", "Cone or small ball"],
    selTags: ["Collaboration", "Communication", "Patience"],
    facilitate: {
      prep: {
        setup: [
          "Set up Bull Ring so that all the strings are laid out.",
          "Place the cone in the center of the ring.",
        ],
        // Changed to simple strings
        materials: ["Bull Ring Set", "Cone"],
      },
      play: {
        steps: [
          {
            stepNumber: 1,
            content: "Students grab a string and pull tight to lift the ring.",
          },
          {
            stepNumber: 2,
            content: "Work together to transport the cone to the finish line.",
          },
        ],
      },
      // Added example Debrief
      debrief: {
        questions: [
          "What was the hardest part about working together?",
          "How did you communicate without talking over each other?",
        ],
      },
    },
  },
  {
    id: "2",
    title: "Rock, Paper, Scissors, Stretch!",
    // Was "6-12"
    gradeLevel: { min: 6, max: 12 },
    // Was "10-50"
    groupSize: { min: 10, max: 50 },
    // Was "5-10 min"
    duration: { min: 5, max: 10 },
    category: "Opener",
    description:
      "A high-energy tournament style game where students compete to become the ultimate champion.",
    energyLevel: "High",
    environment: "Both",
    isSaved: true,
    hasTutorial: false,
    imageUrl: "https://via.placeholder.com/400x300",
    materials: [],
    selTags: ["Resilience", "Social Awareness"],
    facilitate: {
      play: {
        steps: [
          {
            stepNumber: 1,
            content: "Pair up students to play Rock, Paper, Scissors.",
          },
          {
            stepNumber: 2,
            content: "The loser becomes the winner's biggest fan/cheerleader.",
          },
          {
            stepNumber: 3,
            content: "Winners find other winners to play until only two remain.",
          },
        ],
      },
      debrief: {
        questions: ["How did it feel to cheer for someone else?"],
      },
    },
  },
  {
    id: "3",
    title: "Two Truths and a Lie",
    gradeLevel: { min: 3, max: 12 },
    groupSize: { min: 5, max: 15 },
    duration: { min: 15, max: 20 },
    category: "Icebreaker",
    description: "A classic get-to-know-you game that encourages sharing and active listening.",
    energyLevel: "Low",
    environment: "Indoor",
    isSaved: false,
    hasTutorial: false,
    imageUrl: "https://via.placeholder.com/400x300",
    materials: [],
    selTags: ["Relationship Skills", "Self-Management"],
    facilitate: {
      play: {
        steps: [
          {
            stepNumber: 1,
            content: "Students think of two true facts and one lie.",
          },
          {
            stepNumber: 2,
            content: "Group tries to guess which statement is the lie.",
          },
        ],
      },
    },
  },
  {
    id: "4",
    title: "Capture the Flag",
    gradeLevel: { min: 4, max: 12 },
    // Was "20+" (represented as 20-100)
    groupSize: { min: 20, max: 100 },
    duration: { min: 30, max: 60 },
    category: "Active",
    description:
      "Strategic outdoor game requiring speed, stealth, and teamwork to capture the opposing team's flag.",
    energyLevel: "High",
    environment: "Outdoor",
    isSaved: false,
    hasTutorial: true,
    imageUrl: "https://via.placeholder.com/400x300",
    materials: ["2 Flags", "Cones for boundaries"],
    selTags: ["Teamwork", "Strategy", "Physical Activity"],
    facilitate: {
      prep: {
        setup: ["Mark large boundaries.", "Designate jail areas."],
        materials: ["Flags"],
      },
      play: {
        steps: [
          {
            stepNumber: 1,
            content: "Teams try to steal the flag without getting tagged.",
          },
          {
            stepNumber: 2,
            content: "Tagged players go to jail until rescued.",
          },
        ],
      },
    },
  },
  {
    id: "5",
    title: "Circle of Appreciation",
    gradeLevel: { min: 0, max: 12 },
    groupSize: { min: 10, max: 30 },
    duration: { min: 10, max: 15 },
    category: "Connection",
    description: "A calming activity to build community and express gratitude towards peers.",
    energyLevel: "Low",
    environment: "Indoor",
    isSaved: true,
    hasTutorial: false,
    imageUrl: "https://via.placeholder.com/400x300",
    materials: [],
    selTags: ["Social Awareness", "Gratitude"],
    facilitate: {
      play: {
        steps: [
          {
            stepNumber: 1,
            content: "Sit in a circle.",
          },
          {
            stepNumber: 2,
            content: "Pass a talking piece and share an appreciation for someone.",
          },
        ],
      },
    },
  },
  {
    id: "6",
    title: "Stop, Start, Continue",
    gradeLevel: { min: 6, max: 12 },
    groupSize: { min: 5, max: 50 },
    duration: { min: 20, max: 20 }, // Fixed duration represented as same min/max
    category: "Debrief",
    description:
      "A structured reflection tool for groups to analyze their performance and set goals.",
    energyLevel: "Low",
    environment: "Indoor",
    isSaved: false,
    hasTutorial: false,
    imageUrl: "https://via.placeholder.com/400x300",
    materials: ["Whiteboard or Flipchart", "Markers"],
    selTags: ["Self-Reflection", "Goal Setting"],
    facilitate: {
      play: {
        steps: [
          {
            stepNumber: 1,
            content: "Create three columns: Stop, Start, Continue.",
          },
          {
            stepNumber: 2,
            content: "Brainstorm items for each category based on recent activities.",
          },
        ],
      },
    },
  },
  {
    id: "7",
    title: "Human Knot",
    gradeLevel: { min: 3, max: 12 },
    groupSize: { min: 8, max: 12 },
    duration: { min: 10, max: 20 },
    category: "Team Challenge",
    description:
      "A physical puzzle where a group must untangle themselves without letting go of hands.",
    energyLevel: "Medium",
    environment: "Both",
    isSaved: false,
    hasTutorial: true,
    imageUrl: "https://via.placeholder.com/400x300",
    materials: [],
    selTags: ["Problem Solving", "Communication", "Physical Contact"],
    facilitate: {
      play: {
        steps: [
          {
            stepNumber: 1,
            content: "Stand in a tight circle.",
          },
          {
            stepNumber: 2,
            content: "Grab hands with two different people across the circle.",
          },
          {
            stepNumber: 3,
            content: "Untangle the knot without breaking the grip.",
          },
        ],
      },
    },
  },
];

export function getActivityById(id: string): Activity | undefined {
  return mockActivities.find((a) => a.id === id);
}
