export interface ScoreBreakdown {
  skill_match: number;
  keyword_match: number;
  semantic_similarity: number;
  experience_relevance: number;
  final_score: number;
}

export interface ParsedSections {
  skills: string[];
  experience: string[];
  education: string[];
  certifications: string[];
  projects: string[];
  keyword_hits: string[];
}

export interface Suggestion {
  category: string;
  message: string;
}

export interface AnalysisResponse {
  analysis_id: string;
  ats_score: number;
  score_breakdown: ScoreBreakdown;
  matched_skills: string[];
  missing_skills: string[];
  semantic_similarity: number;
  parsed_sections: ParsedSections;
  suggestions: Suggestion[];
  report_url: string;
}

export interface AnalyzeRequest {
  resumeFile: File;
  jdText?: string;
  jdFile?: File | null;
}

