import { motion } from "framer-motion";
import { Award, BriefcaseBusiness, FolderKanban, GraduationCap, ShieldCheck } from "lucide-react";

import { Card } from "../../components/ui/Card";
import type { ParsedSections } from "../../types/analysis";

interface SummaryCardsProps {
  atsScore: number;
  parsedSections: ParsedSections;
}

const format = (value: number) => value.toLocaleString("en-US");

export const SummaryCards = ({ atsScore, parsedSections }: SummaryCardsProps) => {
  const cards = [
    {
      label: "ATS Score",
      value: `${Math.round(atsScore)}/100`,
      tone: "text-primary",
      icon: Award
    },
    {
      label: "Experience Signals",
      value: format(parsedSections.experience.length),
      tone: "text-success",
      icon: BriefcaseBusiness
    },
    {
      label: "Education Entries",
      value: format(parsedSections.education.length),
      tone: "text-warning",
      icon: GraduationCap
    },
    {
      label: "Certifications",
      value: format(parsedSections.certifications.length),
      tone: "text-secondary",
      icon: ShieldCheck
    },
    {
      label: "Projects",
      value: format(parsedSections.projects.length),
      tone: "text-foreground",
      icon: FolderKanban
    }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="h-full p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {card.label}
                </p>
                <div className="rounded-lg border border-border/70 bg-muted/30 p-1.5">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
              <p className={`mt-2 text-2xl font-bold ${card.tone}`}>{card.value}</p>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
