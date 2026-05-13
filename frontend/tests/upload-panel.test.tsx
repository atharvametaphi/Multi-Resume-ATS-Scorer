import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { UploadPanel } from "../src/features/upload/UploadPanel";


describe("UploadPanel", () => {
  it("shows helper text when required inputs are missing", () => {
    render(
      <UploadPanel
        resumeFile={null}
        jdFile={null}
        jdText=""
        onResumeFileChange={vi.fn()}
        onJdFileChange={vi.fn()}
        onJdTextChange={vi.fn()}
        onAnalyze={vi.fn()}
        isLoading={false}
      />
    );

    expect(screen.getByText(/Add both a resume and JD input/i)).toBeInTheDocument();
  });

  it("rejects invalid resume extension", () => {
    const onResumeFileChange = vi.fn();
    const { container } = render(
      <UploadPanel
        resumeFile={null}
        jdFile={null}
        jdText="python backend role"
        onResumeFileChange={onResumeFileChange}
        onJdFileChange={vi.fn()}
        onJdTextChange={vi.fn()}
        onAnalyze={vi.fn()}
        isLoading={false}
      />
    );

    const resumeInput = container.querySelector('input[type="file"][accept=".pdf,.docx"]');
    expect(resumeInput).toBeTruthy();

    const badFile = new File(["not valid"], "resume.txt", { type: "text/plain" });
    fireEvent.change(resumeInput as HTMLInputElement, { target: { files: [badFile] } });

    expect(onResumeFileChange).not.toHaveBeenCalled();
    expect(screen.getByText(/Resume must be a PDF or DOCX file/i)).toBeInTheDocument();
  });
});

