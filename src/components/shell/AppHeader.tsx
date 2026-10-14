"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut, ChevronDown, ShieldCheck, Mail } from "lucide-react";
import { useAdminData } from "@/context/AdminDataContext";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  label: string;
  href: string;
  description: string;
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

export function AppHeader() {
  const pathname = usePathname();
  const { syncWithRemoteBackend, isRefreshing } = useAdminData();
  const { user, logout, getInitials } = useAuth();

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
          className="hidden md:flex items-center gap-1 bg-white/60 p-1 rounded-full border border-black/[0.08] shadow-2xs overflow-x-auto"
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

        {/* Right: Notifications, User Profile Pill */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            aria-label="Notifications"
            className="w-8 h-8 rounded-full border border-black/15 bg-white/80 hover:bg-white text-[#202328] flex items-center justify-center transition-all cursor-pointer relative shadow-2xs"
          >
            <Bell className="w-3.5 h-3.5 text-neutral-700" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#F6CE46]" />
          </button>

          {/* User Profile Pill & Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              id="user-profile-button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-black/15 bg-white/80 hover:bg-white shadow-2xs transition-all cursor-pointer group"
              aria-label="User Profile"
              aria-expanded={isProfileOpen}
            >
              <div className="w-7 h-7 rounded-full border border-black/10 bg-[#F6CE46]/35 flex items-center justify-center text-[11px] font-bold text-[#202328] shadow-2xs">
                <span>{initials}</span>
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
                className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-150 ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown Card */}
            {isProfileOpen && (
              <div
                id="user-profile-dropdown"
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#FFFFFD] border border-black/[0.08] p-3.5 shadow-xl shadow-black/10 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                {/* Profile Card Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-black/[0.06]">
                  <div className="w-10 h-10 rounded-full border border-black/10 bg-[#F6CE46]/40 flex items-center justify-center text-sm font-bold text-[#202328] shadow-2xs shrink-0">
                    <span>{initials}</span>
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
