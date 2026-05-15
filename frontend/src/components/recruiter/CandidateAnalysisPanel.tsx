import { AnimatePresence, motion } from "framer-motion";

import type { CandidateScreeningRecord } from "../../types/recruiter";
import { getScoreTone, toSafePercent } from "../../utils/scoreColor";
import { ATSGauge } from "../charts/ATSGauge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Progress } from "../ui/progress";

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

const Placeholder = ({ text }: { text: string }) => (
  <p className="text-sm text-muted-foreground">{text}</p>
);

const SectionTitle = ({ title }: { title: string }) => (
  <p className="section-kicker">{title}</p>
);

export const CandidateAnalysisPanel = ({ selectedCandidate, reportUrl }: CandidateAnalysisPanelProps) => {
  const analysis = selectedCandidate?.analysis;

  const resumeStats = analysis
    ? [
        { label: "Skills", value: analysis.parsed_sections.skills.length },
        { label: "Experience", value: analysis.parsed_sections.experience.length },
        { label: "Education", value: analysis.parsed_sections.education.length },
        { label: "Certifications", value: analysis.parsed_sections.certifications.length },
        { label: "Projects", value: analysis.parsed_sections.projects.length },
        { label: "Keyword Hits", value: analysis.parsed_sections.keyword_hits.length }
      ]
    : [];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={selectedCandidate?.id ?? "analysis-empty"}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="space-y-4"
      >
        <Card className="border-border/80 bg-card p-5">
          <SectionTitle title="Candidate Analysis" />
          {!analysis ? (
            <div className="mt-3 rounded-xl border border-border/70 bg-muted/20 p-4">
              <Placeholder text="Select a candidate from the table to view AI insights." />
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <ATSGauge score={analysis.ats_score} heightClassName="h-40" />
              <div className="border-t border-border/70 pt-3">
                <p className="truncate text-sm font-medium text-foreground">{selectedCandidate?.fileName}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{getMatchLabel(analysis.ats_score)}</p>
              </div>
              {reportUrl ? (
                <a href={reportUrl} target="_blank" rel="noreferrer" className="block">
                  <Button variant="default" className="w-full">
                    Download PDF Report
                  </Button>
                </a>
              ) : (
                <Button variant="default" className="w-full" disabled>
                  Download PDF Report
                </Button>
              )}
            </div>
          )}
        </Card>

        <Card className="border-border/80 bg-card p-5">
          <SectionTitle title="ATS Breakdown" />
          <div className="mt-3 space-y-3">
            {BREAKDOWN_ROWS.map((row) => {
              const value = toSafePercent(analysis?.score_breakdown[row.key] ?? 0);
              const tone = getScoreTone(value);
              return (
                <div key={row.key}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
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
        </Card>

        <Card className="border-border/80 bg-card p-5">
          <SectionTitle title="Matched Skills" />
          <div className="mt-3 flex flex-wrap gap-2">
            {analysis?.matched_skills.length ? (
              analysis.matched_skills.slice(0, 14).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-border/80 bg-muted/25 px-3 py-1 text-xs font-medium text-foreground"
                >
                  {skill}
                </span>
              ))
            ) : (
              <Placeholder text="No matched skills available." />
            )}
          </div>
        </Card>

        <Card className="border-border/80 bg-card p-5">
          <SectionTitle title="Missing Skills" />
          <div className="mt-3 flex flex-wrap gap-2">
            {analysis?.missing_skills.length ? (
              analysis.missing_skills.slice(0, 14).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-border/80 bg-muted/25 px-3 py-1 text-xs font-medium text-foreground"
                >
                  {skill}
                </span>
              ))
            ) : (
              <Placeholder text="No missing skills identified." />
            )}
          </div>
        </Card>

        <Card className="border-border/80 bg-card p-5">
          <SectionTitle title="AI Recommendation" />
          <ul className="mt-3 space-y-2">
            {analysis?.suggestions.length ? (
              analysis.suggestions.slice(0, 5).map((suggestion, index) => (
                <li
                  key={`${suggestion.category}-${index}`}
                  className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2 text-sm text-muted-foreground"
                >
                  {suggestion.message}
                </li>
              ))
            ) : (
              <li className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2">
                <Placeholder text="No recommendations generated yet." />
              </li>
            )}
          </ul>
        </Card>

        <Card className="border-border/80 bg-card p-5">
          <SectionTitle title="Resume Insights" />
          {analysis ? (
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {resumeStats.map((item) => (
                <div key={item.label} className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2.5">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">{item.label}</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-border/70 bg-muted/20 p-4">
              <Placeholder text="Resume statistics appear after candidate analysis is selected." />
            </div>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
