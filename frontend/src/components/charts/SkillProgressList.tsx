import { motion } from "framer-motion";

import { Progress } from "../ui/progress";
import { getScoreTone, toSafePercent } from "../../utils/scoreColor";

interface SkillProgressListProps {
  matchedSkills: string[];
  totalRequired: number;
}

export const SkillProgressList = ({ matchedSkills, totalRequired }: SkillProgressListProps) => {
  const denominator = totalRequired > 0 ? totalRequired : Math.max(matchedSkills.length, 1);
  const skillMatchPercent = toSafePercent(Math.round((matchedSkills.length / denominator) * 100));
  const scoreTone = getScoreTone(skillMatchPercent);

  return (
    <ul className="space-y-3">
      {matchedSkills.length === 0 ? (
        <li className="rounded-xl border border-border/70 bg-muted/25 p-3 text-sm text-muted-foreground">
          No matched skills yet.
        </li>
      ) : (
        matchedSkills.slice(0, 8).map((skill, index) => {
          return (
            <motion.li
              key={skill}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: index * 0.04 }}
              className="rounded-xl border border-border/70 bg-muted/20 p-3"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{skill}</span>
                <span className={`text-xs font-medium ${scoreTone.textClassName}`}>{skillMatchPercent}%</span>
              </div>
              <Progress
                value={skillMatchPercent}
                className="h-2"
                indicatorClassName={`${scoreTone.barClassName} transition-all duration-500`}
              />
            </motion.li>
          );
        })
      )}
    </ul>
  );
};
