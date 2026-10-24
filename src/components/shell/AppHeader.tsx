"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ChevronDown, ShieldCheck, Mail, PieChart, Download, RefreshCw } from "lucide-react";
import { useAdminData } from "@/context/AdminDataContext";
import { useAuth } from "@/context/AuthContext";
import { usePwa } from "@/context/PwaContext";

interface NavItem {
  label: string;
  href: string;
  description: string;
}

interface AppHeaderProps {
  onOpenDemographics?: () => void;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", description: "Overview" },
  { label: "People", href: "/clients", description: "Registered Clients" },
  { label: "Counseling", href: "/counselling", description: "Counseling Intake" },
  { label: "Inner Healing", href: "/inner-healing", description: "Inner Healing" },
  { label: "Courses", href: "/courses", description: "Courses & Journeys" },
  { label: "Resources", href: "/resources", description: "Resources & Ebooks" },
  { label: "Anonymous Questions", href: "/anonymous-questions", description: "Anonymous Questions" },
  { label: "Users", href: "/users", description: "Console Users & Access Management" },
];

export function AppHeader({ onOpenDemographics }: AppHeaderProps = {}) {
  const pathname = usePathname();
  const { syncWithRemoteBackend, hardRefresh, isRefreshing } = useAdminData();
  const { user, logout, getInitials } = useAuth();
  const { isStandalone, installPwa } = usePwa();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  const initials = getInitials();
  const shortName = user
    ? `${user.firstName} ${user.lastName ? `${user.lastName[0]}.` : ""}`
    : "Admin User";
  const fullName = user
    ? user.fullName ||
      [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ")
    : "Administrator";

  return (
    <header
      id="crextio-header"
      className="shrink-0 border-b border-black/[0.06] bg-white/70 backdrop-blur-md px-6 py-3.5 z-40 relative"
    >
      <div className="w-full flex items-center justify-between gap-4">
        {/* Left: Branding Text (No pill background, no shadow) */}
        <Link
          href="/"
          id="purity-matters-logo-text"
          className="flex items-center gap-2 shrink-0 select-none cursor-pointer"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#F6CE46]" />
          <span className="text-base font-bold tracking-tight text-[#202328]">
            Purity Matters
          </span>
        </Link>

        {/* Center: Crextio Pill Navigation Bar */}
        <nav
          id="crextio-nav-pills"
          className="hidden md:flex items-center gap-1 bg-white/60 p-1 rounded-full border border-black/[0.08] shadow-2xs overflow-x-auto no-scrollbar touch-manipulation select-none"
        >
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-[#202328] text-white shadow-xs"
                    : "text-neutral-600 hover:text-[#202328] hover:bg-black/[0.04]"
                }`}
                title={item.description}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Quick Demographics (mobile), PWA Install, User Profile Flat Indicator */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* PWA Install Button (hidden when running as standalone app) */}
          {!isStandalone && (
            <>
              {/* Desktop Pill */}
              <button
                type="button"
                id="header-pwa-install-desktop"
                onClick={installPwa}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F6CE46] hover:bg-[#ebd534] text-[#202328] font-bold text-xs shadow-2xs transition-all active:scale-95 cursor-pointer"
                title="Install Purity Matters on your device"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Install App</span>
              </button>

              {/* Mobile Round Button */}
              <button
                type="button"
                id="header-pwa-install-mobile"
                onClick={installPwa}
                className="sm:hidden w-8 h-8 rounded-full bg-[#F6CE46] hover:bg-[#ebd534] text-[#202328] flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-2xs"
                title="Install App"
                aria-label="Install App"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </>
          )}

          {onOpenDemographics && (
            <button
              type="button"
              id="mobile-header-demographics-btn"
              onClick={onOpenDemographics}
              aria-label="View Demographics"
              title="Audience Demographics"
              className="lg:hidden w-8 h-8 rounded-full border border-neutral-200 bg-white hover:bg-neutral-100 text-[#202328] flex items-center justify-center transition-colors cursor-pointer relative"
            >
              <PieChart className="w-3.5 h-3.5 text-neutral-700" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#F6CE46]" />
            </button>
          )}

          {/* Hard Refresh Button (Instant Cache-Busting & Tactile Haptic Feedback) */}
          <button
            type="button"
            id="header-hard-refresh-btn"
            onClick={() => hardRefresh()}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-xs font-semibold text-[#202328] border border-black/10 hover:border-black/20 shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-60"
            title="Hard Refresh: Load latest live data"
            aria-label="Hard Refresh"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isRefreshing ? "animate-spin text-[#F6CE46]" : "text-[#202328]"
              }`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* User Account Flat Indicator & Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              id="user-profile-button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200/80 transition-colors cursor-pointer group"
              aria-label="User Account"
              aria-expanded={isProfileOpen}
            >
              <div className="relative shrink-0">
                <div className="w-7 h-7 rounded-full bg-[#202328] text-[#F6CE46] flex items-center justify-center text-[11px] font-bold">
                  <span>{initials}</span>
                </div>
                <span
                  id="user-account-online-indicator"
                  className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-neutral-100"
                />
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-xs font-semibold text-[#202328]">
                  {shortName}
                </span>
                <span className="text-[10px] text-neutral-500 capitalize">
                  {user?.role || "Admin"}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700 transition-transform duration-150 ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown Card */}
            {isProfileOpen && (
              <div
                id="user-profile-dropdown"
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-neutral-200/80 p-3.5 shadow-xl shadow-black/10 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                {/* Profile Card Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-black/[0.06]">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#202328] text-[#F6CE46] flex items-center justify-center text-sm font-bold">
                      <span>{initials}</span>
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#202328] truncate">
                      {fullName}
                    </p>
                    <p className="text-[11px] text-neutral-500 truncate flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
                      <span className="truncate">{user?.email || "admin@puritymatters.org"}</span>
                    </p>
                  </div>
                </div>

                {/* Role & Status Badge */}
                <div className="py-2.5 px-1 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500">Access Level</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#202328] text-white text-[10px] font-medium capitalize flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#F6CE46]" />
                    <span>{user?.role || "Administrator"}</span>
                  </span>
                </div>

                {/* Divider & Logout Action */}
                <div className="pt-2 border-t border-black/[0.06]">
                  <button
                    type="button"
                    id="profile-logout-button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
