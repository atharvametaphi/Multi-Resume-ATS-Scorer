const clampToPercent = (value: number) => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, value));
};

export const getScoreTone = (value: number) => {
  const safeValue = clampToPercent(value);

  if (safeValue > 80) {
    return {
      tone: "high" as const,
      hex: "#7C78F2",
      barClassName: "bg-primary",
      textClassName: "text-primary"
    };
  }

  if (safeValue >= 40) {
    return {
      tone: "medium" as const,
      hex: "#918DF3",
      barClassName: "bg-primary/80",
      textClassName: "text-primary/90"
    };
  }

  return {
    tone: "low" as const,
    hex: "#B9B6F8",
    barClassName: "bg-primary/55",
    textClassName: "text-primary/75"
  };
};

export const toSafePercent = (value: number) => clampToPercent(value);
