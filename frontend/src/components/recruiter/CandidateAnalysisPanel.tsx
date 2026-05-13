import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { ATSGauge } from "../charts/ATSGauge";
import { SkillProgressList } from "../charts/SkillProgressList";
import { SkillsPieChart } from "../charts/SkillsPieChart";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Progress } from "../ui/progress";
import type { CandidateScreeningRecord } from "../../types/recruiter";
import { getScoreTone, toSafePercent } from "../../utils/scoreColor";

interface CandidateAnalysisPanelProps {
  selectedCandidate: CandidateScreeningRecord | null;
  reportUrl: string | null;
}

const BREAKDOWN_ROWS = [
  { key: "skill_match", label: "Skill Match" },
  { key: "keyword_match", label: "Keyword Match" },
  { key: "semantic_similarity", label: "Semantic Similarity" },
  { key: "experience_relevance", label: "Experience Relevance" }
] as const;

const getMatchLabel = (score: number) => {
  if (score > 80) {
    return "Strong Match";
  }
  if (score >= 40) {
    return "Moderate Match";
  }
  return "Weak Match";
};

const getAnalysisPanelMessage = (candidate: CandidateScreeningRecord | null) => {
  if (!candidate) {
    return "Select a candidate from the comparison table to inspect detailed ATS analysis.";
  }
  if (candidate.status === "processing") {
    return "Candidate analysis is in progress. This panel will update automatically after completion.";
  }
  if (candidate.status === "error") {
    return candidate.error ?? "Candidate analysis failed. Retry from the upload panel.";
  }
  return "This candidate has not been analyzed yet.";
};

export const CandidateAnalysisPanel = ({ selectedCandidate, reportUrl }: CandidateAnalysisPanelProps) => {
  const analysis = selectedCandidate?.analysis;

  return (
    <Card className="h-full border-border bg-card p-0">
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Candidate Analysis
        </p>
      </div>

      <div className="space-y-4 p-4">
        <AnimatePresence mode="wait">
          {!analysis ? (
            <motion.div
              key="empty-analysis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-border bg-muted/15 p-4 text-sm text-muted-foreground"
            >
              {getAnalysisPanelMessage(selectedCandidate)}
            </motion.div>
          ) : (
            <motion.div
              key={selectedCandidate?.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <section className="rounded-xl border border-border bg-muted/15 p-3">
                <ATSGauge score={analysis.ats_score} heightClassName="h-56" />
                <div className="mt-1 text-center">
                  <p className="text-2xl font-semibold text-foreground">{Math.round(analysis.ats_score)}%</p>
                  <p className="text-sm text-muted-foreground">{getMatchLabel(analysis.ats_score)}</p>
                </div>
              </section>

              <section className="rounded-xl border border-border bg-muted/15 p-3">
                <p className="mb-3 text-xs uppercase tracking-[0.12em] text-muted-foreground">ATS Breakdown</p>
                <div className="space-y-2.5">
                  {BREAKDOWN_ROWS.map((row) => {
                    const value = toSafePercent(analysis.score_breakdown[row.key]);
                    const tone = getScoreTone(value);
                    return (
                      <div key={row.key}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{row.label}</span>
                          <span className={`font-semibold ${tone.textClassName}`}>{Math.round(value)}%</span>
                        </div>
                        <Progress
                          value={value}
                          className="h-1.5"
                          indicatorClassName={`${tone.barClassName} transition-all duration-500`}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-xl border border-border bg-muted/15 p-3">
                <p className="mb-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">Skill Match Analytics</p>
                <SkillsPieChart
                  matchedCount={analysis.matched_skills.length}
                  missingCount={analysis.missing_skills.length}
                />
                <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <span>Matched: {analysis.matched_skills.length}</span>
                  <span>Missing: {analysis.missing_skills.length}</span>
                </div>
              </section>

              <section className="rounded-xl border border-border bg-muted/15 p-3">
                <p className="mb-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">Skill Match Progress</p>
                <SkillProgressList
                  matchedSkills={analysis.matched_skills}
                  totalRequired={analysis.matched_skills.length + analysis.missing_skills.length}
                />
              </section>

              <details className="group rounded-xl border border-border bg-muted/15 p-3">
                <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Analysis Notes
                  <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">Missing Skills</p>
                    <p className="mt-1">
                      {analysis.missing_skills.length
                        ? analysis.missing_skills.join(", ")
                        : "No missing skills identified for this role."}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Suggestions</p>
                    <ul className="mt-1 space-y-1">
                      {analysis.suggestions.length ? (
                        analysis.suggestions.slice(0, 5).map((suggestion, index) => (
                          <li key={`${suggestion.category}-${index}`}>{suggestion.message}</li>
                        ))
                      ) : (
                        <li>No additional suggestions generated.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </details>

              <section className="space-y-2">
                {reportUrl ? (
                  <a href={reportUrl} target="_blank" rel="noreferrer" className="block">
                    <Button variant="secondary" className="w-full">
                      Download PDF Report
                    </Button>
                  </a>
                ) : (
                  <Button variant="secondary" className="w-full" disabled>
                    Download PDF Report
                  </Button>
                )}
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};
