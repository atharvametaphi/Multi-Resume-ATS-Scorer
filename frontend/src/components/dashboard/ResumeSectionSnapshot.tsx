import { BriefcaseBusiness, FolderKanban, GraduationCap, Medal, Wrench } from "lucide-react";

import type { ParsedSections } from "../../types/analysis";

const SECTION_CONFIG = [
  { key: "skills", label: "Technical Skills", icon: Wrench },
  { key: "experience", label: "Experience", icon: BriefcaseBusiness },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "certifications", label: "Certifications", icon: Medal },
  { key: "projects", label: "Projects", icon: FolderKanban }
] as const;

interface ResumeSectionSnapshotProps {
  parsedSections: ParsedSections;
}

export const ResumeSectionSnapshot = ({ parsedSections }: ResumeSectionSnapshotProps) => {
  return (
    <div className="space-y-3">
      {SECTION_CONFIG.map((section) => {
        const Icon = section.icon;
        const entries = parsedSections[section.key];
        return (
          <div key={section.key} className="rounded-xl border border-border/70 bg-muted/20 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <Icon className="h-4 w-4 text-primary" />
                {section.label}
              </div>
              <span className="text-xs text-muted-foreground">{entries.length}</span>
            </div>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {entries.length ? entries.slice(0, 3).join(" | ") : "No entries extracted yet."}
            </p>
          </div>
        );
      })}
    </div>
  );
};

