import { CheckCircle2, CircleDashed } from "lucide-react";

import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/badge";

interface SkillListsProps {
  matchedSkills: string[];
  missingSkills: string[];
}

const SkillPill = ({ label, tone }: { label: string; tone: "green" | "red" }) => (
  <Badge variant={tone === "green" ? "success" : "danger"} className="px-2.5 py-1 text-[11px] font-semibold">
    {label}
  </Badge>
);

export const SkillLists = ({ matchedSkills, missingSkills }: SkillListsProps) => {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Matched Skills" subtitle="Detected in both resume and JD.">
        <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-success">
          <CheckCircle2 className="h-3.5 w-3.5" />
          High confidence alignment
        </div>
        <div className="flex flex-wrap gap-2">
          {matchedSkills.length ? (
            matchedSkills.map((skill) => <SkillPill key={skill} label={skill} tone="green" />)
          ) : (
            <p className="text-sm text-muted-foreground">No matched skills detected.</p>
          )}
        </div>
      </Card>

      <Card title="Missing Skills" subtitle="Add these naturally where applicable.">
        <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-warning">
          <CircleDashed className="h-3.5 w-3.5" />
          Opportunity area
        </div>
        <div className="flex flex-wrap gap-2">
          {missingSkills.length ? (
            missingSkills.map((skill) => <SkillPill key={skill} label={skill} tone="red" />)
          ) : (
            <p className="text-sm text-muted-foreground">No missing skills detected.</p>
          )}
        </div>
      </Card>
    </div>
  );
};
