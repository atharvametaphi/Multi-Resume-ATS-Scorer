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
    <Card className="border-border bg-card p-0">
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Candidate Comparison
        </p>
      </div>

      <div className="max-h-[520px] overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b border-border text-left text-xs uppercase tracking-[0.08em] text-muted-foreground">
              <th className="px-3 py-3 font-medium">Rank</th>
              <th className="px-3 py-3 font-medium">Candidate Name</th>
              <th className="px-3 py-3 font-medium">ATS Score</th>
              <th className="px-3 py-3 font-medium">Match Level</th>
              <th className="px-3 py-3 font-medium">Skills Match</th>
              <th className="px-3 py-3 font-medium">Missing Skills</th>
              <th className="px-3 py-3 font-medium">Experience Match</th>
              <th className="px-3 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {rankedCandidates.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">
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
                    whileHover={{ backgroundColor: "rgba(99,102,241,0.06)" }}
                    className={`border-b border-border transition-colors ${
                      isSelected ? "bg-primary/10" : isTop ? "bg-primary/6" : ""
                    }`}
                  >
                    <td className="px-3 py-3 font-semibold text-foreground">#{index + 1}</td>
                    <td className="px-3 py-3 text-foreground">{candidate.fileName}</td>
                    <td className="px-3 py-3 font-semibold text-foreground">
                      {analysis ? `${Math.round(analysis.ats_score)}%` : "-"}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{getRowStateLabel(candidate)}</td>
                    <td className="px-3 py-3">
                      <div className="w-[120px]">
                        <Progress
                          value={skillPercent}
                          className="h-1.5"
                          indicatorClassName={`${skillTone.barClassName} transition-all duration-500`}
                        />
                      </div>
                    </td>
                    <td className="max-w-[180px] truncate px-3 py-3 text-muted-foreground">
                      {analysis ? analysis.missing_skills.slice(0, 3).join(", ") || "-" : "-"}
                    </td>
                    <td className="px-3 py-3">
                      <div className="w-[100px]">
                        <Progress
                          value={experiencePercent}
                          className="h-1.5"
                          indicatorClassName="bg-primary transition-all duration-500"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Button
                        size="sm"
                        variant={isSelected ? "secondary" : "outline"}
                        className="h-8 px-2.5"
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
