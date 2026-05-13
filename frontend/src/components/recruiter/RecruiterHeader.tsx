import { Moon, Sun } from "lucide-react";
import brandLogo from "../../assets/logo.svg";

import { Switch } from "../ui/switch";

interface RecruiterHeaderProps {
  isDark: boolean;
  onToggleTheme: (checked: boolean) => void;
}

export const RecruiterHeader = ({ isDark, onToggleTheme }: RecruiterHeaderProps) => {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <img src={brandLogo} alt="RecruitScreen AI logo" className="h-6 w-auto" />
        </div>

        <div className="flex items-center gap-2">
          <Sun className="h-3.5 w-3.5 text-muted-foreground" />
          <Switch checked={isDark} onCheckedChange={onToggleTheme} aria-label="Toggle theme" />
          <Moon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
};
