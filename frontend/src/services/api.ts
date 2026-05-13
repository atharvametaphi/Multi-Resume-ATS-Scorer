import axios from "axios";

import type { AnalysisResponse, AnalyzeRequest } from "../types/analysis";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.toString() ?? "http://localhost:8000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000
});

export const analyzeResume = async ({
  resumeFile,
  jdText,
  jdFile
}: AnalyzeRequest): Promise<AnalysisResponse> => {
  const formData = new FormData();
  formData.append("resume_file", resumeFile);

  if (jdText?.trim()) {
    formData.append("jd_text", jdText);
  }

  if (jdFile) {
    formData.append("jd_file", jdFile);
  }

  const response = await apiClient.post<AnalysisResponse>("/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
};

export const fetchAnalysis = async (analysisId: string) => {
  const response = await apiClient.get(`/analysis/${analysisId}`);
  return response.data;
};

export const getReportDownloadUrl = (reportPath: string): string => {
  if (reportPath.startsWith("http://") || reportPath.startsWith("https://")) {
    return reportPath;
  }

  const base = API_BASE_URL.replace(/\/api\/v1\/?$/, "");
  return `${base}${reportPath}`;
};

