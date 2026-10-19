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
    "http://localhost:3001"
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

  // Check and restore session on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const cachedUserJson = localStorage.getItem(USER_CACHE_KEY);

        if (!storedToken) {
          setIsLoading(false);
          return;
        }

        setToken(storedToken);

        if (cachedUserJson) {
          try {
            setUser(JSON.parse(cachedUserJson));
          } catch {
            // ignore cache parse error
          }
        }

        // Verify token against /api/auth/me
        const response = await fetch(`${apiUrl}/api/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${storedToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const freshUser: ConsoleUser = await response.json();
          setUser(freshUser);
          localStorage.setItem(USER_CACHE_KEY, JSON.stringify(freshUser));
        } else if (response.status === 401 || response.status === 403) {
          // Token expired or invalid
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_CACHE_KEY);
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.warn("Auth session verification warning:", err);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, [apiUrl]);

  // Route protection effect
  useEffect(() => {
    if (isLoading) return;

    const isAuthRoute = pathname === "/login";

    if (!token && !isAuthRoute) {
      router.push("/login");
    } else if (token && isAuthRoute) {
      router.push("/");
    }
  }, [token, isLoading, pathname, router]);

  const login = useCallback(
    async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await fetch(`${apiUrl}/api/auth/login`, {
          method: "POST",
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

        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(loggedInUser));

        setToken(accessToken);
        setUser(loggedInUser);

        router.push("/");
        return { success: true };
      } catch (err: any) {
        return {
          success: false,
          error: err?.message || "Unable to connect to the authentication server",
        };
      }
    },
    [apiUrl, router],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_CACHE_KEY);
    setToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  const getInitials = useCallback((): string => {
    if (!user) return "PM";
    const firstInitial = user.firstName ? user.firstName.charAt(0).toUpperCase() : "";
    const lastInitial = user.lastName ? user.lastName.charAt(0).toUpperCase() : "";
    return `${firstInitial}${lastInitial}` || "AD";
  }, [user]);

  const getTimeGreeting = useCallback((): string => {
    return timeGreeting;
  }, [timeGreeting]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
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
