import { useEffect, useMemo, useState } from "react";

import { CandidateAnalysisPanel } from "./components/recruiter/CandidateAnalysisPanel";
import { CandidateComparisonTable } from "./components/recruiter/CandidateComparisonTable";
import { MultiResumeUploadPanel } from "./components/recruiter/MultiResumeUploadPanel";
import { RecruiterHeader } from "./components/recruiter/RecruiterHeader";
import { RoleSelectionPanel } from "./components/recruiter/RoleSelectionPanel";
import { Card } from "./components/ui/Card";
import { ROLE_PRESETS } from "./data/rolePresets";
import { useTheme } from "./hooks/useTheme";
import { analyzeResume, getReportDownloadUrl } from "./services/api";
import type { CandidateScreeningRecord } from "./types/recruiter";

const createCandidateId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `candidate-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const App = () => {
  const [selectedRoleId, setSelectedRoleId] = useState(ROLE_PRESETS[0].id);
  const [candidates, setCandidates] = useState<CandidateScreeningRecord[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isDark, setDarkMode } = useTheme();

  const selectedRole = useMemo(
    () => ROLE_PRESETS.find((role) => role.id === selectedRoleId) ?? ROLE_PRESETS[0],
    [selectedRoleId]
  );

  const rankedCandidates = useMemo(() => {
    return [...candidates].sort((a, b) => {
      const aScore = a.analysis?.ats_score ?? -1;
      const bScore = b.analysis?.ats_score ?? -1;
      if (aScore !== bScore) {
        return bScore - aScore;
      }

      return a.fileName.localeCompare(b.fileName);
    });
  }, [candidates]);

  useEffect(() => {
    const analyzed = rankedCandidates.filter((candidate) => candidate.analysis);
    if (!analyzed.length) {
      setSelectedCandidateId(null);
      return;
    }
    if (!selectedCandidateId || !analyzed.some((candidate) => candidate.id === selectedCandidateId)) {
      setSelectedCandidateId(analyzed[0].id);
    }
  }, [rankedCandidates, selectedCandidateId]);

  const selectedCandidate = useMemo(
    () => candidates.find((candidate) => candidate.id === selectedCandidateId) ?? null,
    [candidates, selectedCandidateId]
  );

  const selectedReportUrl = selectedCandidate?.analysis?.report_url
    ? getReportDownloadUrl(selectedCandidate.analysis.report_url)
    : null;

  const addFiles = (files: File[]) => {
    setError(null);
    setCandidates((previous) => {
      const existingKeys = new Set(previous.map((candidate) => `${candidate.file.name}-${candidate.file.size}`));
      const next = [...previous];

      for (const file of files) {
        const key = `${file.name}-${file.size}`;
        if (existingKeys.has(key)) {
          continue;
        }
        existingKeys.add(key);
        next.push({
          id: createCandidateId(),
          file,
          fileName: file.name,
          status: "ready",
          progress: 0
        });
      }
      return next;
    });
  };

  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId);
    setSelectedCandidateId(null);
    setError(null);
    setCandidates((previous) =>
      previous.map((candidate) => ({
        ...candidate,
        status: "ready",
        progress: 0,
        analysis: undefined,
        error: undefined
      }))
    );
  };

  const runBatchAnalysis = async () => {
    if (!candidates.length || isProcessing) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    for (const candidate of candidates) {
      setCandidates((previous) =>
        previous.map((current) =>
          current.id === candidate.id
            ? { ...current, status: "processing", progress: 20, error: undefined }
            : current
        )
      );

      try {
        const analysis = await analyzeResume({
          resumeFile: candidate.file,
          jdText: selectedRole.jdText
        });

        setCandidates((previous) =>
          previous.map((current) =>
            current.id === candidate.id
              ? { ...current, status: "completed", progress: 100, analysis }
              : current
          )
        );
      } catch (unknownError) {
        const detail =
          (unknownError as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
          "Analysis failed.";
        setCandidates((previous) =>
          previous.map((current) =>
            current.id === candidate.id
              ? { ...current, status: "error", progress: 100, error: detail }
              : current
          )
        );
        setError(detail);
      }
    }

    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <RecruiterHeader isDark={isDark} onToggleTheme={setDarkMode} />

      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
          <section className="space-y-5">
            <RoleSelectionPanel
              roles={ROLE_PRESETS}
              selectedRoleId={selectedRoleId}
              onRoleChange={handleRoleChange}
            />

            <MultiResumeUploadPanel
              candidates={candidates}
              isProcessing={isProcessing}
              onAddFiles={addFiles}
              onAnalyzeCandidates={runBatchAnalysis}
            />

            <CandidateComparisonTable
              rankedCandidates={rankedCandidates}
              selectedCandidateId={selectedCandidateId}
              onSelectCandidate={setSelectedCandidateId}
            />
          </section>

          <section>
            <div className="lg:sticky lg:top-[4.5rem]">
              <CandidateAnalysisPanel selectedCandidate={selectedCandidate} reportUrl={selectedReportUrl} />
            </div>
          </section>
        </div>

        {error ? (
          <Card className="mt-4 border-primary/40 bg-primary/10 p-3">
            <p className="text-sm text-foreground">{error}</p>
          </Card>
        ) : null}
      </main>
    </div>
  );
};

export default App;
