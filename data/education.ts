import { EducationStage } from "@/lib/types";

export const education: EducationStage[] = [
  {
    id: "schooling",
    inningsLabel: "Innings I",
    inningsTitle: "The Foundation Overs",
    institution: "Kendriya Vidyalaya Sangathan",
    logo: "/images/education/kvs-logo.png",
    chapters: [
      { heading: "Class 1–2", subheading: "KV No. 1 STC, Jabalpur, Madhya Pradesh" },
      { heading: "Class 3–6", subheading: "KV Bengdubi, West Bengal" },
      { heading: "Class 6–9", subheading: "KV Hisar Cantt, Haryana" },
      { heading: "Class 9–12", subheading: "KV PDDU Nagar (Mughalsarai), Uttar Pradesh" },
    ],
  },
  {
    id: "college",
    inningsLabel: "Innings II",
    inningsTitle: "The CSJMU Campaign",
    institution: "Chhatrapati Shahu Ji Maharaj University, Kanpur",
    logo: "/images/education/csjmu-logo.jpg",
    chapters: [
      {
        heading: "1st Year",
        subheading: "Debut Season",
        points: [
          "Competed in the SIH (Smart India Hackathon) internal round",
          "Explored Aeromodelling",
          "Began front-end web development",
          "Started content creation — shooting reels and launching a YouTube channel",
          "Contributed to Media & PR for CSJMU Kanpur",
        ],
      },
      {
        heading: "2nd Year",
        subheading: "Building Momentum",
        points: [
          "Hackathon at IIT Kanpur",
          "SIH internal hackathon — second run",
          "Hackshodh Hackathon",
          "Organized the fresher's party for incoming juniors",
          "Completed an AI/ML course from Pregrad",
          "AI for Bharat Hackathon",
        ],
      },
      {
        heading: "3rd Year",
        subheading: "Peak Form",
        points: [
          "BOB Hackathon",
          "Head of B.Tech Placement Coordinator",
          "Internship at Coderva.ai — ML and Agentic AI",
        ],
      },
    ],
  },
];
