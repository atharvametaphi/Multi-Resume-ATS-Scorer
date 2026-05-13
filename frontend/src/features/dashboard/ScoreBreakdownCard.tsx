import { motion } from "framer-motion";

import { Card } from "../../components/ui/Card";
import { Progress } from "../../components/ui/progress";
import type { ScoreBreakdown } from "../../types/analysis";
import { getScoreTone, toSafePercent } from "../../utils/scoreColor";

interface ScoreBreakdownCardProps {
  breakdown: ScoreBreakdown;
}

const rows: Array<{ key: keyof ScoreBreakdown; label: string }> = [
  { key: "skill_match", label: "Skill Match" },
  { key: "keyword_match", label: "Keyword Match" },
  { key: "semantic_similarity", label: "Semantic Similarity" },
  { key: "experience_relevance", label: "Experience Relevance" }
];

export const ScoreBreakdownCard = ({ breakdown }: ScoreBreakdownCardProps) => {
  return (
    <Card title="ATS Score Breakdown" subtitle="Weighted intelligence components used by the scoring engine.">
      <ul className="space-y-3.5">
        {rows.map((row) => {
          const value = toSafePercent(breakdown[row.key]);
          const scoreTone = getScoreTone(value);

          return (
            <motion.li
              key={row.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-xl border border-border/70 bg-muted/25 p-3.5"
            >
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{row.label}</span>
                <span className={`font-semibold ${scoreTone.textClassName}`}>{Math.round(value)}%</span>
              </div>
              <Progress
                value={value}
                className="h-2.5"
                indicatorClassName={`${scoreTone.barClassName} transition-all duration-500`}
              />
            </motion.li>
          );
        })}
      </ul>
    </Card>
  );
};
