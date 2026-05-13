import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "resume-ai-theme";
type Theme = "light" | "dark";

const resolveInitialTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "dark";
  }

  const fromStorage = window.localStorage.getItem(STORAGE_KEY);
  if (fromStorage === "light" || fromStorage === "dark") {
    return fromStorage;
  }

  return "dark";
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(resolveInitialTheme);
  const isFirstRenderRef = useRef(true);
  const transitionTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const root = document.documentElement;

    if (!isFirstRenderRef.current) {
      root.classList.add("theme-changing");
      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
      }
      transitionTimerRef.current = window.setTimeout(() => {
        root.classList.remove("theme-changing");
        transitionTimerRef.current = null;
      }, 260);
    }

    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
    root.style.colorScheme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);

    isFirstRenderRef.current = false;
  }, [theme]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
      }
      document.documentElement.classList.remove("theme-changing");
    };
  }, []);

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  const setDarkMode = (isDark: boolean) => {
    setTheme(isDark ? "dark" : "light");
  };

  return {
    theme,
    isDark: theme === "dark",
    toggleTheme,
    setDarkMode
  };
};
