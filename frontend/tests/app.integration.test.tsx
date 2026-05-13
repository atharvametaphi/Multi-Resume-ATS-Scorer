import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import App from "../src/App";

const { analyzeResumeMock } = vi.hoisted(() => ({
  analyzeResumeMock: vi.fn()
}));

vi.mock("../src/services/api", async () => {
  const actual = await vi.importActual("../src/services/api");
  return {
    ...actual,
    analyzeResume: analyzeResumeMock,
    getReportDownloadUrl: (path: string) => `http://localhost:8000${path}`
  };
});

describe("App integration", () => {
  it("analyzes resume and renders recruiter analysis workflow", async () => {
    analyzeResumeMock.mockResolvedValueOnce({
      analysis_id: "abc123",
      ats_score: 82,
      score_breakdown: {
        skill_match: 80,
        keyword_match: 75,
        semantic_similarity: 78,
        experience_relevance: 90,
        final_score: 82
      },
      matched_skills: ["Python", "FastAPI", "SQL"],
      missing_skills: ["AWS"],
      semantic_similarity: 78,
      parsed_sections: {
        skills: ["Python", "FastAPI", "SQL"],
        experience: ["Software Engineer"],
        education: ["B.Tech"],
        certifications: [],
        projects: ["Resume Analyzer"],
        keyword_hits: ["python", "api"]
      },
      suggestions: [{ category: "Missing Keywords", message: "Add AWS where relevant." }],
      report_url: "/api/v1/analysis/abc123/report"
    });

    const { container } = render(<App />);

    const resumeInput = container.querySelector('input[type="file"][accept=".pdf,.docx"]');
    expect(resumeInput).toBeTruthy();
    const resumeFile = new File(["resume"], "resume.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });
    fireEvent.change(resumeInput as HTMLInputElement, { target: { files: [resumeFile] } });

    fireEvent.click(screen.getByRole("button", { name: /Analyze Candidates/i }));

    await waitFor(() => {
      expect(screen.getByText(/Strong Match/i)).toBeInTheDocument();
    });

    expect(analyzeResumeMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Step 3 - Candidate Comparison/i)).toBeInTheDocument();
    expect(screen.getByText(/ATS Breakdown/i)).toBeInTheDocument();
    expect(screen.getByText(/Download PDF Report/i)).toBeInTheDocument();
  });
});
