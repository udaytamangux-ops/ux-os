export type ProjectStatus = "In Progress" | "Review" | "Complete";
export type Priority = "High" | "Medium" | "Low";
export type PhaseId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type QuestionCategory = "Discovery" | "Pain Points" | "Behavior" | "Goals";
export type PersonaType = "Primary" | "Secondary";

export interface ProjectBrief {
  problem: string;
  goal: string;
  targetUsers: string;
  constraints: string;
  successMetrics: string;
  businessContext: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  category: QuestionCategory;
  createdAt: string;
}

export interface Persona {
  id: string;
  name: string;
  age: string;
  role: string;
  type: PersonaType;
  bio: string;
  painPoints: string[];
  needs: string[];
  goals: string[];
  initials: string;
  createdAt: string;
}

export interface WireframeFile {
  id: string;
  name: string;
  type: "pdf" | "image";
  uploadedAt: string;
  // We store metadata only — not base64 — to avoid localStorage limits
  size: number;
}

export interface PhaseNote {
  phaseId: PhaseId;
  content: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  category: string;
  status: ProjectStatus;
  priority: Priority;
  currentPhase: PhaseId;
  completedPhases: PhaseId[];
  brief: ProjectBrief;
  interviewQuestions: InterviewQuestion[];
  personas: Persona[];
  phaseNotes: PhaseNote[];
  handoffNotes: string;
  sitemap: SitemapNode | null;
  journeyStages: JourneyStage[];
  testingFindings: TestingFinding[];
  wireframeFiles: FileMetadata[];
  uiScreenFiles: FileMetadata[];
  prototypeLink: string;
  prototypeNotes: string;
  uiDesignNotes: string;
  iaNotes: string;
  caseStudy: string | null;
  caseStudyGeneratedAt: string | null;
  caseStudyTemplate: CaseStudyTemplate;
  navMap: NavigationMap;
  isArchived: boolean;
  isPortfolioPublic: boolean;
  portfolioSlug: string | null;
  daysActive: number;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  company: string;
  role: string;
  email: string;
  phone: string;
  projectId?: string;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  text: string;
  type: "phase" | "upload" | "ai" | "project" | "complete";
  projectId: string;
  timestamp: string;
}

// --- PHASE 2 ADDITIONS ---

export type NodeType = "page" | "section" | "modal" | "external" | "component";

export interface SitemapNode {
  id: string;
  name: string;
  type: NodeType;
  notes: string;
  children: SitemapNode[];
}

export type EmotionLevel =
  | "very_positive"
  | "positive"
  | "neutral"
  | "negative"
  | "very_negative";

export interface JourneyStage {
  id: string;
  stageName: string;
  userAction: string;
  touchpoint: string;
  emotion: EmotionLevel;
  thoughts: string;
  painPoints: string[];
  opportunities: string[];
  order: number;
}

export type FindingSeverity = "critical" | "major" | "minor" | "observation";
export type FindingStatus = "open" | "fixed" | "wont-fix";

export interface TestingFinding {
  id: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  recommendation: string;
  status: FindingStatus;
  createdAt: string;
}

export interface FileMetadata {
  id: string;
  name: string;
  type: "pdf" | "image";
  size: number;
  device?: "desktop" | "mobile" | "tablet";
  notes: string;
  uploadedAt: string;
  // Phase 3: signed URL from Supabase Storage (null for legacy IndexedDB files)
  storageUrl?: string | null;
}

export interface QuickNote {
  id: string;
  content: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

// --- PHASE 3 ADDITIONS ---

export type CaseStudyTemplate = "web" | "mobile" | "branding";

export interface NavMapNode {
  id: string;
  type: "page" | "entry" | "external" | "modal";
  position: { x: number; y: number };
  data: { label: string };
}

export interface NavMapEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: "default" | "straight" | "step";
  animated?: boolean;
}

export interface NavigationMap {
  nodes: NavMapNode[];
  edges: NavMapEdge[];
}

export interface DBRow {
  id: string;
  user_id: string;
  name: string;
  client: string;
  category: string;
  status: string;
  priority: string;
  current_phase: number;
  completed_phases: number[];
  brief: Record<string, string>;
  interview_questions: unknown[];
  personas: unknown[];
  phase_notes: unknown[];
  handoff_notes: string;
  case_study: string | null;
  case_study_generated_at: string | null;
  case_study_template: string;
  sitemap: unknown;
  journey_stages: unknown[];
  testing_findings: unknown[];
  wireframe_files: unknown[];
  ui_screen_files: unknown[];
  nav_map: { nodes: unknown[]; edges: unknown[] };
  prototype_link: string;
  prototype_notes: string;
  ui_design_notes: string;
  ia_notes: string;
  is_archived: boolean;
  is_portfolio_public: boolean;
  portfolio_slug: string | null;
  days_active: number;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

// --- PROMPT VAULT ---

export type AITool =
  | "Midjourney"
  | "DALL-E 3"
  | "Stable Diffusion"
  | "Adobe Firefly"
  | "Veo 3"
  | "Kling AI"
  | "Runway ML"
  | "Sora"
  | "Claude"
  | "Other";

export const AI_TOOLS: AITool[] = [
  "Midjourney",
  "DALL-E 3",
  "Stable Diffusion",
  "Adobe Firefly",
  "Veo 3",
  "Kling AI",
  "Runway ML",
  "Sora",
  "Claude",
  "Other",
];

export interface PromptImage {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  // Blob lives in Supabase Storage (Phase 3); null = needs re-upload.
  storageUrl: string | null;
}

export interface PromptEntry {
  id: string;
  title: string;
  prompt: string;
  negativePrompt: string;
  tool: AITool;
  tags: string[];
  images: PromptImage[];
  notes: string;
  projectId: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}
