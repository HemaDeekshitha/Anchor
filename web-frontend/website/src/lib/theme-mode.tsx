"use client";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "theme";

type ThemeModeContextValue = {
  mode: ThemeMode;
  toggleMode: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

function readStoredMode(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // Use the light default when storage is blocked.
  }
  return "light";
}

function applyMode(mode: ThemeMode) {
  document.documentElement.setAttribute("data-theme", mode);
  const themeColor = mode === "dark" ? "#1a2332" : "#ffffff";
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", themeColor);
}

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  // Always start as light so SSR HTML matches the first client render.
  // The inline script in layout.tsx already applies data-theme for CSS.
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const initial = readStoredMode();
    setMode(initial);
    applyMode(initial);
  }, []);

  const toggleMode = useCallback(() => {
    setMode((current) => {
      const next = current === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Keep the in-memory theme when storage is blocked.
      }
      applyMode(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          background: {
            default: mode === "dark" ? "#0e1217" : "#ffffff",
            paper: mode === "dark" ? "#151b22" : "#ffffff",
          },
          text: {
            primary: mode === "dark" ? "#f4f7fb" : "#111111",
            secondary: mode === "dark" ? "#9aa3ad" : "#666666",
          },
        },
        typography: {
          fontFamily: "inherit",
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
                backgroundColor: "var(--anchor-surface)",
                color: "var(--foreground)",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundColor: "var(--anchor-surface)",
                color: "var(--foreground)",
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                backgroundImage: "none",
                backgroundColor: "var(--anchor-surface)",
              },
            },
          },
          MuiMenu: {
            styleOverrides: {
              paper: {
                backgroundImage: "none",
                backgroundColor: "var(--anchor-surface)",
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                backgroundColor: "var(--anchor-surface-muted)",
                color: "var(--foreground)",
              },
            },
          },
          MuiInputBase: {
            styleOverrides: {
              root: {
                color: "var(--foreground)",
              },
              input: {
                fontSize: "16px",
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within ThemeModeProvider");
  }
  return context;
}
