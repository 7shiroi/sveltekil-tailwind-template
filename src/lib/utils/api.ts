import { goto } from "$app/navigation";
import { get } from "svelte/store";

interface ApiConfig {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
  headers?: Record<string, string>;
  token?: string; // Specific token to use (for refresh/logout calls)
  skipAuth?: boolean; // Skip automatic token handling
  retryOnTokenRefresh?: boolean; // Retry request after token refresh (default: true)
}

interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_KEY = import.meta.env.VITE_API_KEY;

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: any
  ) {
    super(`API Error: ${status} ${statusText}`);
  }
}

// Track ongoing refresh to prevent multiple simultaneous refresh attempts
let refreshPromise: Promise<boolean> | null = null;

const handleUnauthorized = async (
  config: ApiConfig,
  endpoint: string
): Promise<boolean> => {
  // Don't try to refresh if this was already a refresh call or we explicitly skip auth
  if (endpoint.includes("/refresh") || config.skipAuth) {
    return false;
  }

  // Import here to avoid circular dependency
  const { refreshTokens, clearAuth, isRefreshing } = await import(
    "$lib/stores/auth"
  );

  // If already refreshing, wait for it to complete
  if (refreshPromise) {
    return await refreshPromise;
  }

  // If not currently refreshing, start refresh
  if (!get(isRefreshing)) {
    refreshPromise = refreshTokens();
    const success = await refreshPromise;
    refreshPromise = null;
    return success;
  }

  return false;
};

export async function api<T>(
  endpoint: string,
  config: ApiConfig = {}
): Promise<ApiResponse<T>> {
  const {
    method = "GET",
    body,
    headers = {},
    token,
    skipAuth = false,
    retryOnTokenRefresh = true,
  } = config;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
    ...headers,
  };

  // Handle authentication
  if (!skipAuth && !token) {
    // Import here to avoid circular dependency
    const { accessToken, isTokenExpired, refreshTokens } = await import(
      "$lib/stores/auth"
    );

    const currentAccessToken = get(accessToken);

    if (currentAccessToken) {
      // Check if token is expired and refresh if needed
      if (isTokenExpired()) {
        const refreshed = await refreshTokens();
        if (refreshed) {
          // Get the new token after refresh
          const newAccessToken = get(accessToken);
          if (newAccessToken) {
            requestHeaders["Authorization"] = `Bearer ${newAccessToken}`;
          }
        } else {
          // Refresh failed, clear auth and redirect
          const { clearAuth } = await import("$lib/stores/auth");
          clearAuth();
          goto("/login");
          throw new ApiError(
            401,
            "Authentication failed",
            "Token refresh failed"
          );
        }
      } else {
        requestHeaders["Authorization"] = `Bearer ${currentAccessToken}`;
      }
    }
  } else if (token) {
    // Use specific token (for refresh/logout calls)
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  // Make the request
  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    ...(body && { body: JSON.stringify(body) }),
  });

  const data = await response.json();

  if (!response.ok) {
    // Handle 401 Unauthorized
    if (response.status === 401 && retryOnTokenRefresh) {
      const refreshed = await handleUnauthorized(config, endpoint);

      if (refreshed) {
        // Retry the original request with new token
        return api<T>(endpoint, { ...config, retryOnTokenRefresh: false });
      } else {
        // Refresh failed or not attempted, clear auth and redirect
        const { clearAuth } = await import("$lib/stores/auth");
        clearAuth();
        goto("/login");
      }
    }

    throw new ApiError(response.status, response.statusText, data);
  }

  return {
    data,
    status: response.status,
    statusText: response.statusText,
  };
}

// Helper methods for common HTTP methods
export const apiGet = <T>(
  endpoint: string,
  config?: Omit<ApiConfig, "method" | "body">
) => api<T>(endpoint, { ...config, method: "GET" });

export const apiPost = <T>(
  endpoint: string,
  body: any,
  config?: Omit<ApiConfig, "method">
) => api<T>(endpoint, { ...config, method: "POST", body });

export const apiPut = <T>(
  endpoint: string,
  body: any,
  config?: Omit<ApiConfig, "method">
) => api<T>(endpoint, { ...config, method: "PUT", body });

export const apiDelete = <T>(
  endpoint: string,
  config?: Omit<ApiConfig, "method" | "body">
) => api<T>(endpoint, { ...config, method: "DELETE" });

export const apiPatch = <T>(
  endpoint: string,
  body: any,
  config?: Omit<ApiConfig, "method">
) => api<T>(endpoint, { ...config, method: "PATCH", body });

// Specialized login function that doesn't use automatic auth
export const loginApi = async (credentials: {
  username: string;
  password: string;
}) => {
  const response = await api<{
    success: boolean;
    message: string;
    data: { accessToken: string; refreshToken: string; userKey: string };
  }>("/auth/login", {
    method: "POST",
    body: credentials,
    skipAuth: true, // Don't try to use existing tokens for login
  });

  // Extract the actual tokens from the nested structure
  // Backend wraps response in: { success, message, data: { accessToken, refreshToken } }
  const tokens = response.data.data;

  return {
    ...response,
    data: tokens, // Return just the tokens part
  };
};

// Asset handling functions
const assetCache = new Map<string, { url: string; expiry: number }>(); // Cache for URLs with expiry

/**
 * Get asset URL - uses tempUrl if available, otherwise fetches from backend
 */
export const getAssetUrl = async (
  assetInput: string | { tempUrl?: string; url?: string; id?: string }
): Promise<string> => {
  // Handle different input types
  let tempUrl: string | undefined;
  let assetId: string | undefined;
  let fallbackUrl: string | undefined;

  if (typeof assetInput === "string") {
    // If it's a string, treat it as a URL
    if (assetInput.startsWith("/assets/secure/")) {
      tempUrl = assetInput;
    } else if (assetInput.startsWith("/assets/")) {
      fallbackUrl = assetInput;
    } else {
      // External URL or data URL
      return assetInput;
    }
  } else if (assetInput && typeof assetInput === "object") {
    // If it's an object with tempUrl, use that directly
    tempUrl = assetInput.tempUrl;
    assetId = assetInput.id;
    fallbackUrl = assetInput.url;
  }

  // If we have a tempUrl, use it directly (it's already authenticated)
  if (tempUrl) {
    return `${API_URL}${tempUrl}`;
  }

  // If we have an assetId, generate a tempUrl
  if (assetId) {
    const cacheKey = `asset_${assetId}`;
    const cached = assetCache.get(cacheKey);

    // Check if we have a valid cached URL
    if (cached && cached.expiry > Date.now()) {
      return cached.url;
    }

    try {
      // Import here to avoid circular dependency
      const { accessToken, isTokenExpired, refreshTokens } = await import(
        "$lib/stores/auth"
      );

      let currentAccessToken = get(accessToken);

      // Check if token is expired and refresh if needed
      if (isTokenExpired()) {
        const refreshed = await refreshTokens();
        if (refreshed) {
          currentAccessToken = get(accessToken);
        } else {
          throw new Error("Failed to refresh token");
        }
      }

      if (!currentAccessToken) {
        throw new Error("No access token available");
      }

      // Generate tempUrl from backend
      const response = await fetch(`${API_URL}/assets/temp-url/${assetId}`, {
        headers: {
          Authorization: `Bearer ${currentAccessToken}`,
          "x-api-key": API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to generate temp URL: ${response.status}`);
      }

      const { tempUrl: newTempUrl } = await response.json();
      const fullUrl = `${API_URL}${newTempUrl}`;

      // Cache the URL with 4 minute expiry (tokens expire in 5 minutes)
      assetCache.set(cacheKey, {
        url: fullUrl,
        expiry: Date.now() + 240000, // 4 minutes
      });

      return fullUrl;
    } catch (error) {
      console.error("Failed to generate tempUrl for asset:", assetId, error);

      // Fall back to direct URL if available
      if (fallbackUrl) {
        return `${API_URL}${fallbackUrl}`;
      }

      throw error;
    }
  }

  // If we have a fallback URL, try to use it directly
  if (fallbackUrl) {
    return `${API_URL}${fallbackUrl}`;
  }

  // If nothing else works, return a placeholder or throw an error
  throw new Error("No valid asset URL or ID provided");
};

/**
 * Preload asset URLs for better performance
 */
export const preloadAssetUrls = async (
  assets: Array<{ id?: string; tempUrl?: string }>
) => {
  const promises = assets
    .filter((asset) => asset.id && !asset.tempUrl)
    .map((asset) =>
      getAssetUrl(asset).catch((error) => {
        console.warn("Failed to preload asset:", asset.id, error);
        return null;
      })
    );

  await Promise.all(promises);
};

// Clean up asset cache
export const cleanupAssetCache = () => {
  assetCache.clear();
};

// Clean up expired entries from cache
export const cleanupExpiredAssets = () => {
  const now = Date.now();

  for (const [key, value] of assetCache.entries()) {
    if (value.expiry <= now) {
      assetCache.delete(key);
    }
  }
};

// Auto-cleanup expired assets every 5 minutes
if (typeof window !== "undefined") {
  setInterval(cleanupExpiredAssets, 300000); // 5 minutes
}

// Clean up specific asset from cache
export const cleanupAssetUrl = (assetId: string) => {
  const cacheKey = `asset_${assetId}`;
  if (assetCache.has(cacheKey)) {
    assetCache.delete(cacheKey);
  }
};
