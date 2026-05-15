import type { CandidateScreeningRecord } from "../../types/recruiter";
import { Card } from "../ui/Card";

interface CandidateInsightsCardProps {
  candidates: CandidateScreeningRecord[];
}

const formatPercent = (value: number | null) => {
  if (value === null || Number.isNaN(value)) {
    return "--";
  }
  return `${Math.round(value)}%`;
};

export const CandidateInsightsCard = ({ candidates }: CandidateInsightsCardProps) => {
  const analyzed = candidates.filter((candidate) => candidate.analysis);
  const totalCandidates = candidates.length;

  const topAtsScore =
    analyzed.length > 0
      ? Math.max(...analyzed.map((candidate) => candidate.analysis?.ats_score ?? 0))
      : null;

  const averageMatchScore =
    analyzed.length > 0
      ? analyzed.reduce((sum, candidate) => sum + (candidate.analysis?.ats_score ?? 0), 0) / analyzed.length
      : null;

  const missingSkillCounts = analyzed
    .flatMap((candidate) => candidate.analysis?.missing_skills ?? [])
    .reduce<Record<string, number>>((accumulator, skill) => {
      accumulator[skill] = (accumulator[skill] ?? 0) + 1;
      return accumulator;
    }, {});

  const mostMissingSkill =
    Object.entries(missingSkillCounts).sort((left, right) => right[1] - left[1])[0]?.[0] ?? "--";

  return (
    <Card className="h-full border-border/80 bg-card p-6">
      <p className="section-kicker">Candidate Insights</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border/70 bg-muted/25 p-3.5">
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Total Candidates</p>
          <p className="mt-2 text-[28px] font-bold leading-none text-foreground">{totalCandidates}</p>
        </div>

        <div className="rounded-xl border border-border/70 bg-muted/25 p-3.5">
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Top ATS Score</p>
          <p className="mt-2 text-[28px] font-bold leading-none text-foreground">{formatPercent(topAtsScore)}</p>
        </div>

        <div className="rounded-xl border border-border/70 bg-muted/25 p-3.5">
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Average Match Score</p>
          <p className="mt-2 text-[28px] font-bold leading-none text-foreground">{formatPercent(averageMatchScore)}</p>
        </div>

        <div className="rounded-xl border border-border/70 bg-muted/25 p-3.5">
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Most Missing Skill</p>
          <p className="mt-2 truncate text-base font-semibold text-foreground">{mostMissingSkill}</p>
        </div>
      </div>
    </Card>
  );
};
