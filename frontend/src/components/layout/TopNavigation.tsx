import { motion } from "framer-motion";
import { Bell, BrainCircuit, MoonStar, Search, Settings2, SunMedium, Users, FileText, LayoutDashboard } from "lucide-react";

import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

const NAV_ITEMS = [
  { value: "Dashboard", icon: LayoutDashboard },
  { value: "Candidates", icon: Users },
  { value: "AI Analysis", icon: BrainCircuit },
  { value: "Reports", icon: FileText },
  { value: "Settings", icon: Settings2 }
] as const;

interface TopNavigationProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const TopNavigation = ({
  activeTab,
  onTabChange,
  isDark,
  onToggleTheme
}: TopNavigationProps) => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-2xl"
    >
      <div className="mx-auto flex w-full max-w-[1580px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-primary to-secondary p-2.5 shadow-glow">
              <BrainCircuit className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-foreground">RecruitIQ AI</p>
              <p className="text-xs text-muted-foreground">Recruitment Intelligence Platform</p>
            </div>
          </div>

          <div className="hidden min-w-[280px] max-w-[420px] flex-1 items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-3 py-2 lg:flex">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              aria-label="Global Search"
              placeholder="Search candidates, skills, reports..."
              className="h-7 border-none bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-3 py-2 md:flex">
              {isDark ? <MoonStar className="h-4 w-4 text-muted-foreground" /> : <SunMedium className="h-4 w-4 text-muted-foreground" />}
              <Switch checked={isDark} onCheckedChange={onToggleTheme} aria-label="Toggle dark mode" />
            </div>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-9 w-9 border border-border/70">
                    <AvatarFallback>HR</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Workspace</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="h-auto w-full justify-start gap-1 rounded-2xl bg-muted/40 p-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="h-9 rounded-xl px-3 text-sm data-[state=active]:bg-card data-[state=active]:shadow-soft"
                >
                  <Icon className="mr-2 h-3.5 w-3.5" />
                  {item.value}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>
    </motion.header>
  );
};

