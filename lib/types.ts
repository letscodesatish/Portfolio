export interface ProjectColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface ProjectFeature {
  over: string;
  title: string;
  description: string;
}

export interface ProjectStat {
  label: string;
  value: string;
}

export interface ArchitectureLayer {
  layer: string;
  detail: string;
}

export interface Project {
  slug: string;
  jerseyNumber: string;
  jerseyImage: string;
  name: string;
  role: string;
  tagline: string;
  summary: string;
  description: string;
  colors: ProjectColors;
  techStack: string[];
  features: ProjectFeature[];
  stats: ProjectStat[];
  architecture: ArchitectureLayer[];
  screenshots: number;
  github?: string;
  live?: string;
  featured?: boolean;
  result: "Won" | "Draw" | "In Progress";
}

export interface Skill {
  name: string;
}

export interface EducationChapter {
  /** e.g. "Class 1–2" for a schooling posting, or "1st Year" for a college year. */
  heading: string;
  /** School/venue name for schooling; season nickname for a college year. */
  subheading: string;
  /** Achievement bullets — omitted for schooling postings, which are just a venue + duration. */
  points?: string[];
}

export interface EducationStage {
  id: string;
  inningsLabel: string;
  inningsTitle: string;
  institution: string;
  logo: string;
  chapters: EducationChapter[];
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  year: string;
  category: string;
  credentialId?: string;
  verifyUrl?: string;
  verified: boolean;
  accent: string;
  /** Optional real certificate scan/screenshot. Falls back to a generated
   * scoreboard-style certificate preview when omitted. */
  image?: string;
}
