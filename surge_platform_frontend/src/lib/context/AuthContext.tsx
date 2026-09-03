"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, Company, LoginResponseData, VerifyEmailResponseData } from "../types";
import { api, getStoredTokens, setStoredTokens, clearStoredTokens } from "../api";

export interface SignupResponseData {
  message: string;
  otpFallback?: boolean;
}

interface AuthContextType {
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResponseData>;
  signup: (email: string, password: string, name?: string) => Promise<SignupResponseData>;
  verifyOtp: (otpCode: string) => Promise<VerifyEmailResponseData>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = useCallback(async () => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) {
      setUser(null);
      setCompany(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await api.get<User>("/users/me");
      setUser(userData);
      try {
        const companyData = await api.get<Company>("/companies/me");
        setCompany(companyData);
      } catch {
        // Company fetch optional
      }
    } catch (err: unknown) {
      console.error("Failed to fetch user:", err);
      clearStoredTokens();
      setUser(null);
      setCompany(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function init() {
      const { accessToken } = getStoredTokens();
      if (!accessToken) {
        if (active) setIsLoading(false);
        return;
      }

      try {
        const userData = await api.get<User>("/users/me");
        if (active) {
          setUser(userData);
          try {
            const companyData = await api.get<Company>("/companies/me");
            if (active) setCompany(companyData);
          } catch {
            // Optional
          }
        }
      } catch (err: unknown) {
        console.error("Failed to fetch user:", err);
        clearStoredTokens();
        if (active) {
          setUser(null);
          setCompany(null);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void init();

    return () => {
      active = false;
    };
  }, []);

  /**
   * Login: POST /auth/login
   * Backend returns: { accessToken, refreshToken, isVerified, user: { id, email, role } }
   */
  const login = async (email: string, password: string): Promise<LoginResponseData> => {
    const data = await api.post<LoginResponseData>("/auth/login", { email, password });

    if (data.accessToken) {
      setStoredTokens(data.accessToken, data.refreshToken);
      setUser({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        isOnboarded: data.user.isOnboarded,
      });
      try {
        const fullUser = await api.get<User>("/users/me");
        setUser(fullUser);
      } catch {
        // Login user info is sufficient
      }
    }
    return data;
  };

  /**
   * Signup: POST /auth/register
   */
  const signup = async (
    email: string,
    password: string,
    name?: string
  ): Promise<SignupResponseData> => {
    const payload: Record<string, string> = { email, password };
    if (name && name.trim()) {
      payload.fullName = name.trim();
      payload.name = name.trim();
    }
    return await api.post<SignupResponseData>("/auth/register", payload);
  };

  /**
   * Verify OTP: POST /auth/verify-email
   * Backend VerifyTokenDto only accepts: { token } — the 6-digit OTP code
   */
  const verifyOtp = async (otpCode: string): Promise<VerifyEmailResponseData> => {
    const data = await api.post<VerifyEmailResponseData>("/auth/verify-email", { token: otpCode });

    if (data.accessToken) {
      setStoredTokens(data.accessToken, data.refreshToken);
      setUser({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        isOnboarded: data.user.isOnboarded ?? false,
      });
      try {
        const fullUser = await api.get<User>("/users/me");
        setUser(fullUser);
      } catch {
        // Minimal user info is fine
      }
    }
    return data;
  };

  /**
   * Mark Onboarding complete in backend and local context
   */
  const completeOnboarding = async (): Promise<void> => {
    try {
      await api.post("/users/me/complete-onboarding");
      try {
        const fullUser = await api.get<User>("/users/me");
        setUser(fullUser);
        return;
      } catch {
        // Fallback to local state update if GET /users/me is delayed
      }
    } catch (err: unknown) {
      console.warn("Could not mark onboarding complete via backend endpoint:", err);
    }
    setUser((prev) => (prev ? { ...prev, isOnboarded: true } : null));
  };

  /**
   * Logout: POST /auth/logout
   */
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore logout errors
    } finally {
      clearStoredTokens();
      setUser(null);
      setCompany(null);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        verifyOtp,
        logout,
        refreshUser: fetchCurrentUser,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
