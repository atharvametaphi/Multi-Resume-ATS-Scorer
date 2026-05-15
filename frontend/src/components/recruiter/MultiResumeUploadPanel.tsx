import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Upload, X } from "lucide-react";

import type { CandidateScreeningRecord } from "../../types/recruiter";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Progress } from "../ui/progress";

interface MultiResumeUploadPanelProps {
  candidates: CandidateScreeningRecord[];
  isProcessing: boolean;
  onAddFiles: (files: File[]) => void;
  onAnalyzeCandidates: () => void;
  onRemoveCandidate: (candidateId: string) => void;
}

const STATUS_LABEL: Record<CandidateScreeningRecord["status"], string> = {
  ready: "Ready",
  processing: "Analyzing",
  completed: "Completed",
  error: "Failed"
};

export const MultiResumeUploadPanel = ({
  candidates,
  isProcessing,
  onAddFiles,
  onAnalyzeCandidates,
  onRemoveCandidate
}: MultiResumeUploadPanelProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [rejectedCount, setRejectedCount] = useState(0);

  const handleFiles = (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) {
      return;
    }

    const validFiles: File[] = [];
    let rejected = 0;

    for (const file of Array.from(filesList)) {
      const lowerName = file.name.toLowerCase();
      if (lowerName.endsWith(".pdf") || lowerName.endsWith(".docx")) {
        validFiles.push(file);
      } else {
        rejected += 1;
      }
    }

    setRejectedCount(rejected);

    if (validFiles.length) {
      onAddFiles(validFiles);
    }
  };

  return (
    <Card className="border-border/80 bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="section-kicker">Multi Resume Upload</p>
        <Button variant="default" size="sm" onClick={onAnalyzeCandidates} disabled={!candidates.length || isProcessing}>
          {isProcessing ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Processing
            </span>
          ) : (
            "Analyze Candidates"
          )}
        </Button>
      </div>

      <motion.div
        whileHover={{ y: -1 }}
        transition={{ duration: 0.2 }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={`mt-4 rounded-2xl border border-dashed p-9 text-center transition ${
          dragActive ? "border-primary/50 bg-primary/10" : "border-border/80 bg-muted/20"
        }`}
      >
        <div className="mx-auto mb-3 inline-flex rounded-xl bg-primary/10 p-3">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <p className="text-base font-semibold text-foreground">Drag and drop resumes</p>
        <p className="mt-1 text-sm text-muted-foreground">or browse files (PDF, DOCX)</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx"
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </motion.div>

      {rejectedCount > 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {rejectedCount} file{rejectedCount > 1 ? "s were" : " was"} skipped. Only PDF and DOCX are accepted.
        </p>
      ) : null}

      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Uploaded Candidates</p>
        <div className="mt-3 space-y-2.5">
          {candidates.length === 0 ? (
            <p className="rounded-xl border border-border/70 bg-muted/15 px-3 py-2.5 text-sm text-muted-foreground">
              No resumes uploaded yet.
            </p>
          ) : (
            candidates.map((candidate) => (
              <div key={candidate.id} className="rounded-xl border border-border/70 bg-muted/15 px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">{candidate.fileName}</span>
                    <span className="text-xs text-muted-foreground">{STATUS_LABEL[candidate.status]}</span>
                  </div>

                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border/80 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                    onClick={() => onRemoveCandidate(candidate.id)}
                    aria-label={`Remove ${candidate.fileName}`}
                    disabled={candidate.status === "processing"}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <Progress
                  className="mt-2 h-1.5"
                  value={candidate.progress}
                  indicatorClassName="bg-primary transition-all duration-300"
                />
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
};
