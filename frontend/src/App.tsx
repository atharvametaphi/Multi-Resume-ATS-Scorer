import { useEffect, useMemo, useState } from "react";

import { CandidateAnalysisPanel } from "./components/recruiter/CandidateAnalysisPanel";
import { CandidateComparisonTable } from "./components/recruiter/CandidateComparisonTable";
import { CandidateInsightsCard } from "./components/recruiter/CandidateInsightsCard";
import { MultiResumeUploadPanel } from "./components/recruiter/MultiResumeUploadPanel";
import { RecruiterHeader } from "./components/recruiter/RecruiterHeader";
import { RoleSelectionPanel } from "./components/recruiter/RoleSelectionPanel";
import { Card } from "./components/ui/Card";
import { useTheme } from "./hooks/useTheme";
import { analyzeResume, fetchJobDescriptions, getReportDownloadUrl } from "./services/api";
import type { CandidateScreeningRecord, RolePreset } from "./types/recruiter";

const createCandidateId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `candidate-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const App = () => {
  const [roles, setRoles] = useState<RolePreset[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [candidates, setCandidates] = useState<CandidateScreeningRecord[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRolesLoading, setIsRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { isDark, setDarkMode } = useTheme();

  useEffect(() => {
    const loadRoles = async () => {
      setIsRolesLoading(true);
      setRolesError(null);
      try {
        const remoteRoles = await fetchJobDescriptions();
        if (!remoteRoles.length) {
          setRoles([]);
          setSelectedRoleId("");
          setRolesError("No job descriptions found in database.");
          return;
        }
        setRoles(remoteRoles);
        setSelectedRoleId((current) =>
          current && remoteRoles.some((role) => role.id === current) ? current : remoteRoles[0].id
        );
      } catch {
        setRoles([]);
        setSelectedRoleId("");
        setRolesError("Failed to load job descriptions from database.");
      } finally {
        setIsRolesLoading(false);
      }
    };

    void loadRoles();
  }, []);

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) ?? null,
    [roles, selectedRoleId]
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

  const removeCandidate = (candidateId: string) => {
    setCandidates((previous) => previous.filter((candidate) => candidate.id !== candidateId));
    setSelectedCandidateId((previous) => (previous === candidateId ? null : previous));
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
    if (!selectedRole || !candidates.length || isProcessing) {
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

      <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          {/* <h1 className="text-2xl font-semibold text-foreground">AI Resume Screening Dashboard</h1> */}
        </div>

        <div className="grid gap-6 lg:grid-cols-[2.3fr_1fr]">
          <section className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <RoleSelectionPanel
                roles={roles}
                selectedRoleId={selectedRoleId}
                onRoleChange={handleRoleChange}
              />
              <CandidateInsightsCard candidates={candidates} />
            </div>

            <MultiResumeUploadPanel
              candidates={candidates}
              isProcessing={isProcessing}
              onAddFiles={addFiles}
              onAnalyzeCandidates={runBatchAnalysis}
              onRemoveCandidate={removeCandidate}
            />

            <CandidateComparisonTable
              rankedCandidates={rankedCandidates}
              selectedCandidateId={selectedCandidateId}
              onSelectCandidate={setSelectedCandidateId}
            />
          </section>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:pr-1">
            <CandidateAnalysisPanel selectedCandidate={selectedCandidate} reportUrl={selectedReportUrl} />
          </aside>
        </div>

        {error ? (
          <Card className="mt-5 border-primary/25 bg-primary/10 p-4">
            <p className="text-sm text-foreground">{error}</p>
          </Card>
        ) : null}

        {rolesError ? (
          <Card className="mt-5 border-primary/25 bg-primary/10 p-4">
            <p className="text-sm text-foreground">{rolesError}</p>
          </Card>
        ) : null}

        {isRolesLoading ? (
          <Card className="mt-5 border-border/80 bg-card p-4">
            <p className="text-sm text-muted-foreground">Loading job descriptions...</p>
          </Card>
        ) : null}
      </main>
    </div>
  );
};

export default App;
