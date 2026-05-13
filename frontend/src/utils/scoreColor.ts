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
      hex: "#10B981",
      barClassName: "bg-emerald-500",
      textClassName: "text-emerald-400"
    };
  }

  if (safeValue >= 40) {
    return {
      tone: "medium" as const,
      hex: "#F59E0B",
      barClassName: "bg-amber-500",
      textClassName: "text-amber-400"
    };
  }

  return {
    tone: "low" as const,
    hex: "#EF4444",
    barClassName: "bg-red-500",
    textClassName: "text-red-400"
  };
};

export const toSafePercent = (value: number) => clampToPercent(value);
