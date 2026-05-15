import { motion } from "framer-motion";
import { Eye } from "lucide-react";

import type { CandidateScreeningRecord } from "../../types/recruiter";
import { getScoreTone } from "../../utils/scoreColor";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Progress } from "../ui/progress";

interface CandidateComparisonTableProps {
  rankedCandidates: CandidateScreeningRecord[];
  selectedCandidateId: string | null;
  onSelectCandidate: (candidateId: string) => void;
}

const getMatchLevel = (score: number) => {
  if (score > 80) {
    return "Strong";
  }
  if (score >= 40) {
    return "Moderate";
  }
  return "Weak";
};

const getRowStateLabel = (candidate: CandidateScreeningRecord) => {
  if (candidate.analysis) {
    return getMatchLevel(candidate.analysis.ats_score);
  }
  if (candidate.status === "processing") {
    return "Processing";
  }
  if (candidate.status === "error") {
    return "Failed";
  }
  return "Pending";
};

export const CandidateComparisonTable = ({
  rankedCandidates,
  selectedCandidateId,
  onSelectCandidate
}: CandidateComparisonTableProps) => {
  const topCandidateId = rankedCandidates.find((candidate) => Boolean(candidate.analysis))?.id ?? null;

  return (
    <Card className="border-border/80 bg-card p-0">
      <div className="border-b border-border/80 px-6 py-4">
        <p className="section-kicker">Candidate Comparison</p>
      </div>

      <div className="max-h-[560px] overflow-auto px-3 pb-2">
        <table className="w-full border-separate border-spacing-y-1 text-sm">
          <thead className="sticky top-0 z-10 bg-card/96 backdrop-blur-sm">
            <tr className="text-left text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              <th className="px-3 py-3.5 font-semibold">Rank</th>
              <th className="px-3 py-3.5 font-semibold">Candidate Name</th>
              <th className="px-3 py-3.5 font-semibold">ATS Score</th>
              <th className="px-3 py-3.5 font-semibold">Match Level</th>
              <th className="px-3 py-3.5 font-semibold">Skills Match</th>
              <th className="px-3 py-3.5 font-semibold">Missing Skills</th>
              <th className="px-3 py-3.5 font-semibold">Experience Match</th>
              <th className="px-3 py-3.5 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {rankedCandidates.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Upload resumes and run analysis to populate candidate comparison.
                </td>
              </tr>
            ) : (
              rankedCandidates.map((candidate, index) => {
                const analysis = candidate.analysis;
                const totalSkills = (analysis?.matched_skills.length ?? 0) + (analysis?.missing_skills.length ?? 0);
                const skillPercent = totalSkills ? Math.round(((analysis?.matched_skills.length ?? 0) / totalSkills) * 100) : 0;
                const experiencePercent = Math.round(analysis?.score_breakdown.experience_relevance ?? 0);
                const skillTone = getScoreTone(skillPercent);
                const isTop = topCandidateId === candidate.id;
                const isSelected = selectedCandidateId === candidate.id;
                const canView = Boolean(analysis);

                return (
                  <motion.tr
                    key={candidate.id}
                    whileHover={{ backgroundColor: "rgba(124,120,242,0.07)" }}
                    className={`rounded-xl transition-colors ${
                      isSelected ? "bg-primary/10" : isTop ? "bg-primary/6" : ""
                    }`}
                  >
                    <td className="px-3 py-4">
                      <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-muted px-2 text-xs font-semibold text-foreground">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-foreground">{candidate.fileName}</td>
                    <td className="px-3 py-4 font-semibold text-foreground">
                      {analysis ? `${Math.round(analysis.ats_score)}%` : "-"}
                    </td>
                    <td className="px-3 py-4 text-muted-foreground">{getRowStateLabel(candidate)}</td>
                    <td className="px-3 py-4">
                      <div className="w-[130px]">
                        <Progress
                          value={skillPercent}
                          className="h-2"
                          indicatorClassName={`${skillTone.barClassName} transition-all duration-500`}
                        />
                      </div>
                    </td>
                    <td className="max-w-[190px] truncate px-3 py-4 text-muted-foreground">
                      {analysis ? analysis.missing_skills.slice(0, 3).join(", ") || "-" : "-"}
                    </td>
                    <td className="px-3 py-4">
                      <div className="w-[110px]">
                        <Progress
                          value={experiencePercent}
                          className="h-2"
                          indicatorClassName="bg-primary/80 transition-all duration-500"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <Button
                        size="sm"
                        variant={isSelected ? "secondary" : "outline"}
                        className="h-8 rounded-lg px-3"
                        onClick={() => onSelectCandidate(candidate.id)}
                        disabled={!canView}
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        View
                      </Button>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
