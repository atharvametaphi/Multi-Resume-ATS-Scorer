import { render, screen } from "@testing-library/react";

import { ScoreBreakdownCard } from "../src/features/dashboard/ScoreBreakdownCard";
import { SuggestionsPanel } from "../src/features/analysis/SuggestionsPanel";


describe("Dashboard components", () => {
  it("renders score breakdown values", () => {
    render(
      <ScoreBreakdownCard
        breakdown={{
          skill_match: 80,
          keyword_match: 70,
          semantic_similarity: 60,
          experience_relevance: 90,
          final_score: 75
        }}
      />
    );

    expect(screen.getByText(/Skill Match/i)).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
  });

  it("renders suggestion messages", () => {
    render(
      <SuggestionsPanel
        suggestions={[
          { category: "Missing Keywords", message: "Add Docker and AWS evidence." },
          { category: "Better Wording", message: "Use action-oriented verbs." }
        ]}
      />
    );

    expect(screen.getByText(/Missing Keywords/i)).toBeInTheDocument();
    expect(screen.getByText(/Add Docker and AWS evidence/i)).toBeInTheDocument();
  });
});

