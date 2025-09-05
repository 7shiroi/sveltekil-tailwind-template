import { browser } from "$app/environment";
import { writable, get, derived } from "svelte/store";
import { goto } from "$app/navigation";

interface TokenData {
  accessToken: string;
  refreshToken: string;
  userKey: string;
  expiresAt?: number; // Timestamp when access token expires
}

interface User {
  id: string;
  username: string;
  role: string;
  userKey: string;
}

// Initialize from localStorage on client side
const getInitialTokenData = (): TokenData | null => {
  if (!browser) return null;

  try {
    const stored = localStorage.getItem("tokenData");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const getInitialUser = (): User | null => {
  if (!browser) return null;

  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// Core stores
export const tokenData = writable<TokenData | null>(getInitialTokenData());
export const user = writable<User | null>(getInitialUser());
export const isRefreshing = writable<boolean>(false);

// Derived stores
export const isAuthenticated = derived(
  tokenData,
  ($tokenData) => $tokenData !== null && !!$tokenData.accessToken
);

export const accessToken = derived(
  tokenData,
  ($tokenData) => $tokenData?.accessToken || null
);

export const refreshToken = derived(
  tokenData,
  ($tokenData) => $tokenData?.refreshToken || null
);

// Helper to decode JWT payload (client-side only, for UI purposes)
const decodeJwtPayload = (token: string): any => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) {
      console.error("Invalid JWT format - missing payload section");
      return null;
    }

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const parsed = JSON.parse(jsonPayload);
    return parsed;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
};

// Store tokens and user data
export const setTokens = (tokens: {
  accessToken: string;
  refreshToken: string;
  userKey: string;
}) => {
  if (
    !tokens ||
    !tokens.accessToken ||
    !tokens.refreshToken ||
    !tokens.userKey
  ) {
    console.error("Invalid tokens provided to setTokens:", tokens);
    return;
  }

  const payload = decodeJwtPayload(tokens.accessToken);
  const expiresAt = payload?.exp ? payload.exp * 1000 : undefined; // Convert to milliseconds

  const tokenDataValue: TokenData = {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    userKey: tokens.userKey,
    expiresAt,
  };

  const userData: User | null = payload
    ? {
        id: payload.sub,
        username: payload.username,
        role: payload.role,
        userKey: payload.userKey,
      }
    : null;

  if (browser) {
    localStorage.setItem("tokenData", JSON.stringify(tokenDataValue));
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    }
  }

  tokenData.set(tokenDataValue);
  user.set(userData);
};

// Clear all auth data
export const clearAuth = () => {
  if (browser) {
    localStorage.removeItem("tokenData");
    localStorage.removeItem("user");
  }
  tokenData.set(null);
  user.set(null);
  isRefreshing.set(false);
};

// Check if access token is expired or will expire soon (within 1 minute)
export const isTokenExpired = (): boolean => {
  const tokens = get(tokenData);
  if (!tokens?.expiresAt) return true;

  const now = Date.now();
  const buffer = 60 * 1000; // 1 minute buffer
  return now + buffer >= tokens.expiresAt;
};

// Auto-refresh tokens when they're about to expire
export const scheduleTokenRefresh = () => {
  const tokens = get(tokenData);
  if (!tokens?.expiresAt) return;

  const now = Date.now();
  const timeUntilExpiry = tokens.expiresAt - now;
  const refreshTime = Math.max(0, timeUntilExpiry - 2 * 60 * 1000); // Refresh 2 minutes before expiry

  if (refreshTime > 0) {
    setTimeout(() => {
      if (get(isAuthenticated) && !get(isRefreshing)) {
        refreshTokens();
      }
    }, refreshTime);
  }
};

// Refresh tokens function (will be called from api.ts)
export const refreshTokens = async (): Promise<boolean> => {
  const tokens = get(tokenData);
  const currentRefreshToken = tokens?.refreshToken;

  if (!currentRefreshToken || get(isRefreshing)) {
    return false;
  }

  isRefreshing.set(true);

  try {
    // Import here to avoid circular dependency
    const { api } = await import("$lib/utils/api");

    const response = await api<{
      success: boolean;
      message: string;
      data: { accessToken: string; refreshToken: string; userKey: string };
    }>("/auth/refresh", {
      method: "POST",
      token: currentRefreshToken,
    });

    // Extract tokens from nested structure (same as login)
    const newTokens = response.data.data;

    setTokens(newTokens);
    scheduleTokenRefresh(); // Schedule the next refresh
    return true;
  } catch (error) {
    console.error("Token refresh failed:", error);
    clearAuth();
    goto("/login");
    return false;
  } finally {
    isRefreshing.set(false);
  }
};

// Logout from current device
export const logout = async (): Promise<void> => {
  const tokens = get(tokenData);
  const currentRefreshToken = tokens?.refreshToken;

  if (currentRefreshToken) {
    try {
      // Import here to avoid circular dependency
      const { api } = await import("$lib/utils/api");

      await api("/admin/auth/logout", {
        method: "POST",
        token: currentRefreshToken,
      });
    } catch (error) {
      console.error("Logout API call failed:", error);
      // Continue with local logout even if API call fails
    }
  }

  clearAuth();
  goto("/login");
};

// Logout from all devices
export const logoutAll = async (): Promise<void> => {
  const tokens = get(tokenData);
  const currentRefreshToken = tokens?.refreshToken;

  if (currentRefreshToken) {
    try {
      // Import here to avoid circular dependency
      const { api } = await import("$lib/utils/api");

      await api("/admin/auth/logout-all", {
        method: "POST",
        token: currentRefreshToken,
      });
    } catch (error) {
      console.error("Logout all API call failed:", error);
      // Continue with local logout even if API call fails
    }
  }

  clearAuth();
  goto("/login");
};

// Initialize auth on app start
export const initializeAuth = () => {
  if (browser && get(isAuthenticated)) {
    // Check if token is expired on app start
    if (isTokenExpired()) {
      refreshTokens();
    } else {
      scheduleTokenRefresh();
    }
  }
};
