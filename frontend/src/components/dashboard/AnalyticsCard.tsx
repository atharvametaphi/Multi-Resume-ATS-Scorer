import type { PropsWithChildren, ReactNode } from "react";
import { motion } from "framer-motion";

import { Card } from "../ui/Card";
import { cn } from "../../lib/utils";

interface AnalyticsCardProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const AnalyticsCard = ({
  title,
  subtitle,
  icon,
  className,
  bodyClassName,
  children
}: AnalyticsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className="h-full"
    >
      <Card className={cn("h-full", className)}>
        <div className="flex items-start justify-between p-5 pb-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
          {icon ? <div className="rounded-lg border border-border/70 bg-muted/30 p-2">{icon}</div> : null}
        </div>
        <div className={cn("px-5 pb-5", bodyClassName)}>{children}</div>
      </Card>
    </motion.div>
  );
};

