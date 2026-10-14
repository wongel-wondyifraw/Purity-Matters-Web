"use client";

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const result = await login(email, password);
    if (!result.success) {
      setErrorMessage(result.error || "Invalid email or password.");
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("admin@puritymatters.org");
    setPassword("Admin@12345");
    setErrorMessage(null);
  };

  return (
    <div
      id="login-page-container"
      className="min-h-screen w-full bg-[#EBECEF] flex flex-col items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden"
    >
      {/* Decorative ambient background blur orbs matching brand palette */}
      <div
        id="ambient-orb-top"
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#F6CE46]/15 blur-3xl pointer-events-none"
      />
      <div
        id="ambient-orb-bottom"
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#202328]/5 blur-3xl pointer-events-none"
      />

      <div
        id="login-card-wrapper"
        className="w-full max-w-[440px] z-10 flex flex-col gap-5"
      >
        {/* Main Login Card */}
        <div
          id="login-card"
          className="bg-[#FFFFFD] border border-black/[0.08] rounded-[28px] p-7 sm:p-9 shadow-xl shadow-black/[0.03] backdrop-blur-sm"
        >
          {/* Brand Header */}
          <div id="login-brand-header" className="flex flex-col items-center text-center mb-7">
            <div
              id="login-brand-mark"
              className="flex items-center gap-2 mb-2 cursor-pointer"
            >
              <span className="w-3 h-3 rounded-full bg-[#F6CE46] shadow-xs" />
              <span className="text-xl font-bold tracking-tight text-[#202328]">
                Purity Matters
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Web Console Administration
            </p>
            <p className="text-sm text-neutral-600 mt-2 font-normal">
              Sign in to manage counseling, journeys, and bot operations.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              id="login-error-alert"
              className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2.5 text-xs font-medium animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form id="login-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email Field */}
            <div id="email-field-container" className="flex flex-col gap-1.5">
              <label
                htmlFor="login-email-input"
                className="text-xs font-semibold text-[#202328] px-1"
              >
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-4 h-4 text-neutral-500 pointer-events-none" />
                <input
                  id="login-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@puritymatters.org"
                  required
                  autoComplete="email"
                  className="w-full h-11 pl-11 pr-4 rounded-full border border-black/15 bg-white text-sm text-[#202328] placeholder:text-neutral-500 focus:outline-none focus:border-[#202328] focus:ring-2 focus:ring-[#F6CE46]/50 transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Password Field */}
            <div id="password-field-container" className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-1">
                <label
                  htmlFor="login-password-input"
                  className="text-xs font-semibold text-[#202328]"
                >
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-4 h-4 text-neutral-500 pointer-events-none" />
                <input
                  id="login-password-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full h-11 pl-11 pr-11 rounded-full border border-black/15 bg-white text-sm text-[#202328] placeholder:text-neutral-500 focus:outline-none focus:border-[#202328] focus:ring-2 focus:ring-[#F6CE46]/50 transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 p-1 rounded-full text-neutral-500 hover:text-[#202328] transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-button"
              type="submit"
              disabled={isSubmitting || authLoading}
              className="mt-2 w-full h-11 rounded-full bg-[#202328] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#F6CE46]" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Console</span>
                  <ArrowRight className="w-4 h-4 text-[#F6CE46] transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pill Helper */}
          <div
            id="demo-credentials-container"
            className="mt-6 pt-5 border-t border-black/[0.07] flex flex-col items-center gap-2"
          >
            <p className="text-[11px] text-neutral-500">
              Quick development credentials:
            </p>
            <button
              type="button"
              id="fill-demo-credentials-button"
              onClick={handleFillDemo}
              className="px-3.5 py-1.5 rounded-full border border-black/10 bg-black/[0.03] hover:bg-black/[0.06] text-xs font-medium text-[#202328] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4A818]" />
              <span>Fill Default Admin Credentials</span>
            </button>
          </div>
        </div>

        {/* Footer Security Note */}
        <div id="login-footer-note" className="text-center text-xs text-neutral-500">
          <p>Protected by 256-bit JWT Security · Purity Matters Admin Portal</p>
        </div>
      </div>
    </div>
  );
}
