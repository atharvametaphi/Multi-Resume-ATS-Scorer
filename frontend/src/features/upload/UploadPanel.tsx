import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2, Sparkles, UploadCloud } from "lucide-react";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Progress } from "../../components/ui/progress";
import { Textarea } from "../../components/ui/textarea";

interface UploadPanelProps {
  resumeFile: File | null;
  jdFile: File | null;
  jdText: string;
  onResumeFileChange: (file: File | null) => void;
  onJdFileChange: (file: File | null) => void;
  onJdTextChange: (value: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

const RESUME_EXTENSIONS = [".pdf", ".docx"];
const JD_EXTENSIONS = [".pdf", ".docx", ".txt"];

export const UploadPanel = ({
  resumeFile,
  jdFile,
  jdText,
  onResumeFileChange,
  onJdFileChange,
  onJdTextChange,
  onAnalyze,
  isLoading
}: UploadPanelProps) => {
  const resumeInputRef = useRef<HTMLInputElement | null>(null);
  const jdInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      return;
    }

    setProgress(12);
    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 92) {
          return current;
        }
        return current + Math.max(2, Math.round((100 - current) * 0.1));
      });
    }, 280);

    return () => window.clearInterval(interval);
  }, [isLoading]);

  const validateExtension = (file: File, allowed: string[]) => {
    const lowerName = file.name.toLowerCase();
    return allowed.some((ext) => lowerName.endsWith(ext));
  };

  const handleResume = (file: File | null) => {
    if (!file) {
      onResumeFileChange(null);
      return;
    }
    if (!validateExtension(file, RESUME_EXTENSIONS)) {
      setError("Resume must be a PDF or DOCX file.");
      return;
    }
    setError(null);
    onResumeFileChange(file);
  };

  const handleJdFile = (file: File | null) => {
    if (!file) {
      onJdFileChange(null);
      return;
    }
    if (!validateExtension(file, JD_EXTENSIONS)) {
      setError("JD file must be PDF, DOCX, or TXT.");
      return;
    }
    setError(null);
    onJdFileChange(file);
  };

  const canAnalyze = Boolean(resumeFile && (jdText.trim().length > 0 || jdFile));

  return (
    <Card
      title="AI Candidate Intake"
      subtitle="Upload resume + role context to start AI recruiter intelligence."
      className="h-full"
    >
      <motion.div
        role="button"
        tabIndex={0}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.995 }}
        onClick={() => resumeInputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            resumeInputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          handleResume(event.dataTransfer.files[0] ?? null);
        }}
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed p-7 text-center transition ${
          dragActive
            ? "border-primary bg-primary/10 shadow-glow"
            : "border-border/80 bg-muted/20 hover:border-primary/60"
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.25),_transparent_62%)] opacity-70" />
        <div className="relative flex flex-col items-center">
          <div className="mb-3 rounded-2xl bg-primary/15 p-3">
            <UploadCloud className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground">Drag and drop resume here</p>
          <p className="mt-1 text-xs text-muted-foreground">Accepted: PDF, DOCX</p>
          <Button variant="outline" className="mt-4" type="button">
            Choose Resume
          </Button>
          <input
            ref={resumeInputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(event) => handleResume(event.target.files?.[0] ?? null)}
          />
        </div>
      </motion.div>

      <div className="mt-4 flex flex-wrap gap-2">
        {resumeFile ? (
          <Badge variant="outline" className="inline-flex items-center gap-1.5 px-3 py-1.5">
            <FileText className="h-3.5 w-3.5" />
            {resumeFile.name}
          </Badge>
        ) : null}
        {jdFile ? (
          <Badge variant="outline" className="inline-flex items-center gap-1.5 px-3 py-1.5">
            <FileText className="h-3.5 w-3.5" />
            {jdFile.name}
          </Badge>
        ) : null}
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="jd-text">
          Job Description Text
        </label>
        <Textarea
          id="jd-text"
          className="h-36 resize-none"
          placeholder="Paste the job description here..."
          value={jdText}
          onChange={(event) => onJdTextChange(event.target.value)}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => jdInputRef.current?.click()}>
            Upload JD File
          </Button>
          <input
            ref={jdInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={(event) => handleJdFile(event.target.files?.[0] ?? null)}
          />
        </div>
        <Button type="button" onClick={onAnalyze} disabled={!canAnalyze || isLoading}>
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </span>
          ) : (
            "Run ATS Analysis"
          )}
        </Button>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-2 rounded-xl border border-border/70 bg-muted/20 p-3">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              AI Processing
            </div>
            <span className="text-xs text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} indicatorClassName="bg-gradient-to-r from-primary to-secondary" />
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {!error && !canAnalyze ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Add both a resume and JD input (text or file) to start analysis.
        </p>
      ) : null}
    </Card>
  );
};
