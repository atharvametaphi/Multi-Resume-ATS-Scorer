import { useEffect, useMemo, useState } from "react";

import { getScoreTone, toSafePercent } from "../../utils/scoreColor";

interface ATSGaugeProps {
  score: number;
  heightClassName?: string;
}

const GAUGE_RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;
const GAUGE_SWEEP_DEGREES = 260;
const GAUGE_START_ROTATION = 130;
const TRACK_LENGTH = (CIRCUMFERENCE * GAUGE_SWEEP_DEGREES) / 360;

export const ATSGauge = ({ score, heightClassName = "h-72" }: ATSGaugeProps) => {
  const safeScore = toSafePercent(score);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let frame = 0;
    const steps = 30;
    const delta = safeScore / steps;
    setAnimatedScore(0);

    const tick = () => {
      frame += 1;
      setAnimatedScore((current) => {
        const next = Math.min(safeScore, current + delta);
        return frame >= steps ? safeScore : next;
      });
      if (frame < steps) {
        window.requestAnimationFrame(tick);
      }
    };

    const raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [safeScore]);

  const tone = getScoreTone(animatedScore);
  const valueLength = useMemo(() => (TRACK_LENGTH * animatedScore) / 100, [animatedScore]);

  return (
    <div className={`${heightClassName} flex w-full items-center justify-center`} aria-label="ATS score gauge">
      <div className="relative aspect-square w-full max-w-[290px]">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <g transform={`rotate(${GAUGE_START_ROTATION} 50 50)`}>
            <circle
              cx="50"
              cy="50"
              r={GAUGE_RADIUS}
              fill="none"
              stroke="rgba(148,163,184,0.25)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${TRACK_LENGTH} ${CIRCUMFERENCE}`}
            />
            <circle
              cx="50"
              cy="50"
              r={GAUGE_RADIUS}
              fill="none"
              stroke={tone.hex}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${valueLength} ${CIRCUMFERENCE}`}
            />
          </g>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-5xl font-bold leading-none" style={{ color: tone.hex }}>
            {`${Math.round(animatedScore)}%`}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">ATS Compatibility</p>
        </div>
      </div>
    </div>
  );
};
