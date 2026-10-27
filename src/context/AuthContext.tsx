"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { ConsoleUser, AuthContextType } from "@/types/auth";

const TOKEN_KEY = "purity_console_token";
const USER_CACHE_KEY = "purity_console_user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<ConsoleUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [timeGreeting, setTimeGreeting] = useState<string>("Welcome back");

  const apiUrl = (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");

  // Compute time-aware greeting on client mount to avoid prerender new Date() warnings
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setTimeGreeting("Good morning");
    } else if (hour >= 12 && hour < 17) {
      setTimeGreeting("Good afternoon");
    } else if (hour >= 17 && hour < 22) {
      setTimeGreeting("Good evening");
    } else {
      setTimeGreeting("Welcome back");
    }
  }, []);

  // Check and restore session on mount with timeout and validated isolation
  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const storedToken = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
        const cachedUserJson = typeof window !== "undefined" ? localStorage.getItem(USER_CACHE_KEY) : null;

        if (!storedToken) {
          if (isMounted) {
            setToken(null);
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        let parsedUser: ConsoleUser | null = null;
        if (cachedUserJson) {
          try {
            parsedUser = JSON.parse(cachedUserJson);
            if (isMounted && parsedUser) {
              setToken(storedToken);
              setUser(parsedUser);
              setIsLoading(false);
            }
          } catch {
            parsedUser = null;
          }
        }

        // Verify token against /api/auth/me with an 8-second timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        try {
          const response = await fetch(`${apiUrl}/api/auth/me`, {
            method: "GET",
            signal: controller.signal,
            headers: {
              Authorization: `Bearer ${storedToken}`,
              "Content-Type": "application/json",
            },
          });

          if (!isMounted) return;

          if (response.ok) {
            const freshUser: ConsoleUser = await response.json();
            setUser(freshUser);
            setToken(storedToken);
            if (typeof window !== "undefined") {
              localStorage.setItem(USER_CACHE_KEY, JSON.stringify(freshUser));
            }
          } else if (response.status === 401 || response.status === 403) {
            // Token rejected by server
            if (typeof window !== "undefined") {
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(USER_CACHE_KEY);
            }
            setToken(null);
            setUser(null);
          } else {
            // Server error: if no parsed user exists, clear session
            if (!parsedUser) {
              if (typeof window !== "undefined") {
                localStorage.removeItem(TOKEN_KEY);
              }
              setToken(null);
              setUser(null);
            }
          }
        } catch (networkErr: any) {
          if (!isMounted) return;
          // If offline or unreachable, only keep session if we have cached user data.
          // Otherwise, clear the orphaned token to avoid an unauthenticated hanging screen.
          if (!parsedUser) {
            if (typeof window !== "undefined") {
              localStorage.removeItem(TOKEN_KEY);
            }
            setToken(null);
            setUser(null);
          }
        } finally {
          clearTimeout(timeoutId);
          if (isMounted) {
            setIsLoading(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [apiUrl]);

  // Listen for unauthorized 401/403 events from API requests to auto-logout
  useEffect(() => {
    const handleUnauthorized = () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_CACHE_KEY);
      }
      setToken(null);
      setUser(null);
      router.push("/login");
    };

    window.addEventListener("purity:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("purity:unauthorized", handleUnauthorized);
    };
  }, [router]);

  // Route protection effect and pointer-events defensive cleanup
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.pointerEvents = "";
      document.documentElement.style.pointerEvents = "";
    }

    if (isLoading) return;

    const isAuthRoute = pathname === "/login";
    const hasValidSession = Boolean(token && user);

    if (!hasValidSession && !isAuthRoute) {
      router.push("/login");
    } else if (hasValidSession && isAuthRoute) {
      router.push("/");
    }
  }, [token, user, isLoading, pathname, router]);

  const login = useCallback(
    async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(`${apiUrl}/api/auth/login`, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email.trim(), password: pass }),
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            success: false,
            error: data.message || "Invalid email or password",
          };
        }

        const { accessToken, user: loggedInUser } = data;

        if (typeof window !== "undefined") {
          localStorage.setItem(TOKEN_KEY, accessToken);
          localStorage.setItem(USER_CACHE_KEY, JSON.stringify(loggedInUser));
        }

        setToken(accessToken);
        setUser(loggedInUser);

        router.push("/");
        return { success: true };
      } catch (err: any) {
        if (err?.name === "AbortError") {
          return {
            success: false,
            error: "Authentication server timed out. Please check your internet connection.",
          };
        }
        return {
          success: false,
          error: err?.message || "Unable to connect to the authentication server",
        };
      } finally {
        clearTimeout(timeoutId);
      }
    },
    [apiUrl, router],
  );

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_CACHE_KEY);
      window.dispatchEvent(new CustomEvent("purity:logout"));
    }
    setToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  const getInitials = useCallback((): string => {
    if (!user) return "";
    const firstInitial = user.firstName ? user.firstName.charAt(0).toUpperCase() : "";
    const lastInitial = user.lastName ? user.lastName.charAt(0).toUpperCase() : "";
    return `${firstInitial}${lastInitial}` || (user.email ? user.email.charAt(0).toUpperCase() : "");
  }, [user]);

  const getTimeGreeting = useCallback((): string => {
    return timeGreeting;
  }, [timeGreeting]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(token && user),
    login,
    logout,
    getInitials,
    getTimeGreeting,
    timeGreeting,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
