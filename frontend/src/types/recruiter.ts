import type { AnalysisResponse } from "./analysis";

export interface RolePreset {
  id: string;
  title: string;
  jdPreview: string;
  jdText: string;
  requiredSkills: string[];
}

export type CandidateStatus = "ready" | "processing" | "completed" | "error";

export interface CandidateScreeningRecord {
  id: string;
  file: File;
  fileName: string;
  status: CandidateStatus;
  progress: number;
  analysis?: AnalysisResponse;
  error?: string;
}

