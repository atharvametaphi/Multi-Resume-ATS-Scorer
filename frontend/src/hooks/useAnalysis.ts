import { useMemo, useState } from "react";

import { analyzeResume } from "../services/api";
import type { AnalysisResponse } from "../types/analysis";

export const useAnalysis = () => {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async (resumeFile: File, jdText: string, jdFile: File | null) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeResume({ resumeFile, jdText, jdFile });
      setAnalysis(result);
    } catch (unknownError) {
      const detail =
        (unknownError as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
        "Failed to analyze resume. Please try again.";
      setError(detail);
    } finally {
      setIsLoading(false);
    }
  };

  const hasData = useMemo(() => Boolean(analysis), [analysis]);

  return {
    analysis,
    isLoading,
    error,
    hasData,
    runAnalysis
  };
};

