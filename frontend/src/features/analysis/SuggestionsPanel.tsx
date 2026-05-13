import { motion } from "framer-motion";
import { Bot, ChevronDown, Sparkles } from "lucide-react";

import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/badge";
import type { Suggestion } from "../../types/analysis";

interface SuggestionsPanelProps {
  suggestions: Suggestion[];
}

export const SuggestionsPanel = ({ suggestions }: SuggestionsPanelProps) => {
  return (
    <Card
      title="AI Improvement Suggestions"
      subtitle="Context-aware improvements to maximize recruiter relevance and ATS discoverability."
    >
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <motion.details
            key={`${suggestion.category}-${index}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: index * 0.05 }}
            className="group overflow-hidden rounded-xl border border-border/70 bg-muted/20"
          >
            <summary className="flex list-none items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/20 p-1.5">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{suggestion.category}</p>
                  <Badge variant="outline" className="mt-1 text-[10px] uppercase tracking-[0.12em]">
                    AI Recommendation
                  </Badge>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <div className="border-t border-border/60 px-4 py-3 text-sm text-muted-foreground">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Suggested Action
              </div>
              <p>{suggestion.message}</p>
            </div>
          </motion.details>
        ))}
      </div>
    </Card>
  );
};
