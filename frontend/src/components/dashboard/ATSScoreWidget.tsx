import { motion } from "framer-motion";
import { BrainCircuit, CheckCircle2, CircleAlert, CircleDotDashed, Sparkles } from "lucide-react";

import { ATSGauge } from "../charts/ATSGauge";
import { Badge } from "../ui/badge";
import { Card } from "../ui/Card";
import { getScoreTone, toSafePercent } from "../../utils/scoreColor";

interface ATSScoreWidgetProps {
  atsScore: number;
  semanticSimilarity: number;
  matchedSkillsCount: number;
  missingSkillsCount: number;
  summaryText: string;
}

const getMatchStatus = (value: number) => {
  const score = toSafePercent(value);
  if (score > 80) {
    return {
      label: "Excellent Match",
      icon: CheckCircle2,
      badgeVariant: "success" as const
    };
  }
  if (score >= 65) {
    return {
      label: "Strong Match",
      icon: Sparkles,
      badgeVariant: "secondary" as const
    };
  }
  if (score >= 40) {
    return {
      label: "Moderate Match",
      icon: CircleDotDashed,
      badgeVariant: "warning" as const
    };
  }
  return {
    label: "Weak Match",
    icon: CircleAlert,
    badgeVariant: "danger" as const
  };
};

export const ATSScoreWidget = ({
  atsScore,
  semanticSimilarity,
  matchedSkillsCount,
  missingSkillsCount,
  summaryText
}: ATSScoreWidgetProps) => {
  const status = getMatchStatus(atsScore);
  const tone = getScoreTone(atsScore);
  const StatusIcon = status.icon;

  return (
    <Card className="relative overflow-hidden border-white/10 ai-gradient p-0">
      <div className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-8 h-52 w-52 rounded-full bg-secondary/25 blur-3xl" />

      <div className="relative grid gap-4 p-6 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Hero Analytics</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground xl:text-4xl">ATS Intelligence Score</h1>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge variant={status.badgeVariant} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs">
              <StatusIcon className="h-3.5 w-3.5" />
              {status.label}
            </Badge>
            <Badge variant="outline" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs">
              <BrainCircuit className="h-3.5 w-3.5" />
              AI Match Status
            </Badge>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground"
          >
            {summaryText}
          </motion.p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-[11px] uppercase tracking-[0.13em] text-muted-foreground">Semantic Match</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{Math.round(semanticSimilarity)}%</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-[11px] uppercase tracking-[0.13em] text-muted-foreground">Skills Matched</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{matchedSkillsCount}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-[11px] uppercase tracking-[0.13em] text-muted-foreground">Missing Skills</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{missingSkillsCount}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-[11px] uppercase tracking-[0.13em] text-muted-foreground">Confidence Band</p>
              <p className={`mt-1 text-xl font-semibold ${tone.textClassName}`}>{status.label}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <ATSGauge score={atsScore} heightClassName="h-80" />
        </div>
      </div>
    </Card>
  );
};

