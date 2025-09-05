export const APP_NAME = "APP NAME";
export const VERSION = "0.0.1";
export const STARTING_YEAR = 2025;

// UI Configuration
export const SIDEBAR_COLLAPSED_WIDTH = "4rem"; // 64px
export const SIDEBAR_EXPANDED_WIDTH = "18rem"; // 288px
export const MOBILE_BREAKPOINT = 768; // px

// Theme colors (matching your current slate theme)
export const THEME_COLORS = {
  primary: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },
} as const;

// Animation durations
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 200,
  slow: 300,
} as const;

// Z-index layers
export const Z_INDEX = {
  dropdown: 10,
  tooltip: 20,
  sidebar: 30,
  modal: 40,
  toast: 50,
} as const;
