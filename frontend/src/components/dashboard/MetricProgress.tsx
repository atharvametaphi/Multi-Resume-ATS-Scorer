import { motion } from "framer-motion";

import { Progress } from "../ui/progress";
import { getScoreTone, toSafePercent } from "../../utils/scoreColor";

interface MetricProgressProps {
  label: string;
  value: number;
  helper?: string;
}

export const MetricProgress = ({ label, value, helper }: MetricProgressProps) => {
  const safeValue = toSafePercent(value);
  const tone = getScoreTone(safeValue);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border border-border/70 bg-muted/20 p-3"
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className={`text-sm font-semibold ${tone.textClassName}`}>{Math.round(safeValue)}%</p>
      </div>
      <Progress
        value={safeValue}
        className="h-2.5"
        indicatorClassName={`${tone.barClassName} transition-all duration-500`}
      />
      {helper ? <p className="mt-2 text-xs text-muted-foreground">{helper}</p> : null}
    </motion.div>
  );
};

