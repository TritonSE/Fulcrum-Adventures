import type { Activity } from "../types/activity";

export const mockActivities: Activity[] = [
  {
    id: "1",
    title: "Bull Ring - Ice Cream Challenge",
    gradeLevel: "K-12",
    groupSize: "5-20",
    duration: "5-15 min",
    category: "Team Challenge",
    description:
      "A team-based coordination activity that requires students to work together to transport an object using shared control.",
    energyLevel: "Medium",
    environment: "Outdoor",
    isSaved: false,
    hasTutorial: true,
    imageUrl: "https://via.placeholder.com/400x300",
    objective: "Move the ice cream cone to 'the kid' without dropping it.",
    materials: [
      { name: "Bull Ring Set", isChecked: false },
      { name: "Cone or small ball", isChecked: false },
    ],
    selTags: ["Collaboration", "Communication", "Patience"],
    facilitate: {
      prep: {
        setup: [
          "Set up Bull Ring so that all the strings are laid out.",
          "Place the cone in the center of the ring.",
        ],
        materials: [
          { name: "Bull Ring Set", isChecked: false },
          { name: "Cone", isChecked: false },
        ],
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
    },
  },
  {
    id: "2",
    title: "Rock, Paper, Scissors, Stretch!",
    gradeLevel: "6-12",
    groupSize: "10-50",
    duration: "5-10 min",
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
    },
  },
  {
    id: "3",
    title: "Two Truths and a Lie",
    gradeLevel: "3-12",
    groupSize: "5-15",
    duration: "15-20 min",
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
    gradeLevel: "4-12",
    groupSize: "20+",
    duration: "30-60 min",
    category: "Active",
    description:
      "Strategic outdoor game requiring speed, stealth, and teamwork to capture the opposing team's flag.",
    energyLevel: "High",
    environment: "Outdoor",
    isSaved: false,
    hasTutorial: true,
    imageUrl: "https://via.placeholder.com/400x300",
    materials: [
      { name: "2 Flags", isChecked: false },
      { name: "Cones for boundaries", isChecked: false },
    ],
    selTags: ["Teamwork", "Strategy", "Physical Activity"],
    facilitate: {
      prep: {
        setup: ["Mark large boundaries.", "Designate jail areas."],
        materials: [{ name: "Flags", isChecked: false }],
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
    gradeLevel: "K-12",
    groupSize: "10-30",
    duration: "10-15 min",
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
    gradeLevel: "6-12",
    groupSize: "5-50",
    duration: "20 min",
    category: "Debrief",
    description:
      "A structured reflection tool for groups to analyze their performance and set goals.",
    energyLevel: "Low",
    environment: "Indoor",
    isSaved: false,
    hasTutorial: false,
    imageUrl: "https://via.placeholder.com/400x300",
    materials: [
      { name: "Whiteboard or Flipchart", isChecked: false },
      { name: "Markers", isChecked: false },
    ],
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
    gradeLevel: "3-12",
    groupSize: "8-12",
    duration: "10-20 min",
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
