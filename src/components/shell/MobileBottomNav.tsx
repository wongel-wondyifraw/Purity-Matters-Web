"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  HeartHandshake,
  HelpCircle,
  Menu,
  X,
  Sparkles,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  PieChart,
  RefreshCw,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAdminData } from "@/context/AdminDataContext";
import { useAuth } from "@/context/AuthContext";

interface MobileBottomNavProps {
  onOpenDemographics: () => void;
}

export function MobileBottomNav({ onOpenDemographics }: MobileBottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { counselingCount, syncWithRemoteBackend, hardRefresh, isRefreshing } = useAdminData();
  const { logout, user } = useAuth();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Check which tab is active
  const isDashboardActive = pathname === "/";
  const isPeopleActive = pathname.startsWith("/clients");
  const isCounselingActive = pathname.startsWith("/counselling");
  const isQuestionsActive = pathname.startsWith("/anonymous-questions");
  const isMoreActive =
    pathname.startsWith("/inner-healing") ||
    pathname.startsWith("/courses") ||
    pathname.startsWith("/resources") ||
    pathname.startsWith("/donations") ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/activities");

  // Automatically close more menu whenever pathname changes
  React.useEffect(() => {
    setIsMoreMenuOpen(false);
    if (typeof document !== "undefined") {
      document.body.style.pointerEvents = "";
      document.documentElement.style.pointerEvents = "";
    }
  }, [pathname]);

  const handleNavigation = (href: string) => {
    setIsMoreMenuOpen(false);
    if (typeof document !== "undefined") {
      document.body.style.pointerEvents = "";
      document.documentElement.style.pointerEvents = "";
    }
    router.push(href);
  };

  const handleSync = async () => {
    setIsMoreMenuOpen(false);
    await hardRefresh();
  };

  const handleDemographicsClick = () => {
    setIsMoreMenuOpen(false);
    onOpenDemographics();
  };

  return (
    <div id="mobile-nav-root">
      {/* FIXED BOTTOM NAVIGATION BAR */}
      <nav
        id="mobile-bottom-nav-bar"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-black/[0.08] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 pt-1 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))] md:hidden touch-manipulation select-none"
        aria-label="Mobile Navigation"
      >
        <div className="grid grid-cols-5 items-center justify-around max-w-lg mx-auto">
          {/* Tab 1: Dashboard */}
          <Link
            id="mobile-tab-dashboard"
            href="/"
            className={`flex flex-col items-center justify-center min-h-[50px] py-1 transition-all group touch-manipulation active:scale-95 cursor-pointer ${
              isDashboardActive ? "text-[#202328]" : "text-neutral-400 hover:text-neutral-700"
            }`}
          >
            <div
              className={`w-9 h-7 rounded-full flex items-center justify-center transition-all ${
                isDashboardActive ? "bg-[#202328] text-[#F6CE46]" : "bg-transparent text-current"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                isDashboardActive ? "font-bold text-[#202328]" : "font-medium"
              }`}
            >
              Dashboard
            </span>
          </Link>

          {/* Tab 2: People / Clients */}
          <Link
            id="mobile-tab-people"
            href="/clients"
            className={`flex flex-col items-center justify-center min-h-[50px] py-1 transition-all group touch-manipulation active:scale-95 cursor-pointer ${
              isPeopleActive ? "text-[#202328]" : "text-neutral-400 hover:text-neutral-700"
            }`}
          >
            <div
              className={`w-9 h-7 rounded-full flex items-center justify-center transition-all ${
                isPeopleActive ? "bg-[#202328] text-[#F6CE46]" : "bg-transparent text-current"
              }`}
            >
              <Users className="w-4 h-4" />
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                isPeopleActive ? "font-bold text-[#202328]" : "font-medium"
              }`}
            >
              People
            </span>
          </Link>

          {/* Tab 3: Counseling Intake */}
          <Link
            id="mobile-tab-counseling"
            href="/counselling"
            className={`flex flex-col items-center justify-center min-h-[50px] py-1 relative transition-all group touch-manipulation active:scale-95 cursor-pointer ${
              isCounselingActive ? "text-[#202328]" : "text-neutral-400 hover:text-neutral-700"
            }`}
          >
            <div
              className={`w-9 h-7 rounded-full flex items-center justify-center relative transition-all ${
                isCounselingActive ? "bg-[#202328] text-[#F6CE46]" : "bg-transparent text-current"
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              {counselingCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#F6CE46] text-[#202328] text-[9px] font-bold flex items-center justify-center shadow-2xs border border-white">
                  <span>{counselingCount}</span>
                </span>
              )}
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                isCounselingActive ? "font-bold text-[#202328]" : "font-medium"
              }`}
            >
              Counseling
            </span>
          </Link>

          {/* Tab 4: Questions */}
          <Link
            id="mobile-tab-questions"
            href="/anonymous-questions"
            className={`flex flex-col items-center justify-center min-h-[50px] py-1 transition-all group touch-manipulation active:scale-95 cursor-pointer ${
              isQuestionsActive ? "text-[#202328]" : "text-neutral-400 hover:text-neutral-700"
            }`}
          >
            <div
              className={`w-9 h-7 rounded-full flex items-center justify-center transition-all ${
                isQuestionsActive ? "bg-[#202328] text-[#F6CE46]" : "bg-transparent text-current"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                isQuestionsActive ? "font-bold text-[#202328]" : "font-medium"
              }`}
            >
              Questions
            </span>
          </Link>

          {/* Tab 5: More Menu Button */}
          <button
            type="button"
            id="mobile-tab-more"
            onClick={() => setIsMoreMenuOpen(true)}
            className={`flex flex-col items-center justify-center min-h-[50px] py-1 transition-all group touch-manipulation active:scale-95 cursor-pointer ${
              isMoreActive || isMoreMenuOpen
                ? "text-[#202328]"
                : "text-neutral-400 hover:text-neutral-700"
            }`}
            aria-label="Open More Menu"
          >
            <div
              className={`w-9 h-7 rounded-full flex items-center justify-center transition-all ${
                isMoreActive || isMoreMenuOpen
                  ? "bg-[#202328] text-[#F6CE46]"
                  : "bg-transparent text-current"
              }`}
            >
              <Menu className="w-4 h-4" />
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                isMoreActive || isMoreMenuOpen
                  ? "font-bold text-[#202328]"
                  : "font-medium"
              }`}
            >
              More
            </span>
          </button>
        </div>
      </nav>

      {/* MORE MENU SLIDE-UP BOTTOM SHEET (Clean, high-performance translucent backdrop without nested backdrop-filter to eliminate black flicker/glitch) */}
      {isMoreMenuOpen && (
        <div
          id="mobile-more-menu-backdrop"
          className="fixed inset-0 z-50 bg-black/50 flex flex-col justify-end md:hidden animate-in fade-in-0 duration-150 touch-manipulation"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div
            id="mobile-more-menu-sheet"
            className="bg-white rounded-t-3xl border-t border-black/10 shadow-2xl p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] max-h-[85vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-200 will-change-transform"
            style={{ transform: "translateZ(0)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab Handle */}
            <div className="w-10 h-1 bg-neutral-300 rounded-full mx-auto mb-3" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F6CE46]" />
                <h3 className="text-sm font-bold text-[#202328] tracking-tight">
                  Console Sections & Tools
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-[#202328] hover:bg-black/5 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Links Grid */}
            <div className="py-3 space-y-1.5">
              {/* Inner Healing */}
              <button
                type="button"
                id="mobile-nav-inner-healing"
                onClick={() => handleNavigation("/inner-healing")}
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all touch-manipulation cursor-pointer text-left active:scale-[0.98] ${
                  pathname.startsWith("/inner-healing")
                    ? "bg-[#202328] text-white"
                    : "bg-neutral-50 hover:bg-neutral-100 text-[#202328]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      pathname.startsWith("/inner-healing")
                        ? "bg-[#F6CE46] text-[#202328]"
                        : "bg-white text-[#202328] border border-black/10"
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight">Inner Healing</h4>
                    <p
                      className={`text-[10px] mt-0.5 leading-tight ${
                        pathname.startsWith("/inner-healing")
                          ? "text-white/70"
                          : "text-neutral-500"
                      }`}
                    >
                      Prayer & deliverance requests
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50 shrink-0" />
              </button>

              {/* Courses */}
              <button
                type="button"
                id="mobile-nav-courses"
                onClick={() => handleNavigation("/courses")}
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all touch-manipulation cursor-pointer text-left active:scale-[0.98] ${
                  pathname.startsWith("/courses")
                    ? "bg-[#202328] text-white"
                    : "bg-neutral-50 hover:bg-neutral-100 text-[#202328]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      pathname.startsWith("/courses")
                        ? "bg-[#F6CE46] text-[#202328]"
                        : "bg-white text-[#202328] border border-black/10"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight">Courses & Journeys</h4>
                    <p
                      className={`text-[10px] mt-0.5 leading-tight ${
                        pathname.startsWith("/courses")
                          ? "text-white/70"
                          : "text-neutral-500"
                      }`}
                    >
                      Lesson tracking & accountability
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50 shrink-0" />
              </button>

              {/* Resources */}
              <button
                type="button"
                id="mobile-nav-resources"
                onClick={() => handleNavigation("/resources")}
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all touch-manipulation cursor-pointer text-left active:scale-[0.98] ${
                  pathname.startsWith("/resources")
                    ? "bg-[#202328] text-white"
                    : "bg-neutral-50 hover:bg-neutral-100 text-[#202328]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      pathname.startsWith("/resources")
                        ? "bg-[#F6CE46] text-[#202328]"
                        : "bg-white text-[#202328] border border-black/10"
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight">Resources & eBooks</h4>
                    <p
                      className={`text-[10px] mt-0.5 leading-tight ${
                        pathname.startsWith("/resources")
                          ? "text-white/70"
                          : "text-neutral-500"
                      }`}
                    >
                      Downloads & physical book orders
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50 shrink-0" />
              </button>

              {/* Donations */}
              <button
                type="button"
                id="mobile-nav-donations"
                onClick={() => handleNavigation("/donations")}
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all touch-manipulation cursor-pointer text-left active:scale-[0.98] ${
                  pathname.startsWith("/donations")
                    ? "bg-[#202328] text-white"
                    : "bg-neutral-50 hover:bg-neutral-100 text-[#202328]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      pathname.startsWith("/donations")
                        ? "bg-[#F6CE46] text-[#202328]"
                        : "bg-white text-[#202328] border border-black/10"
                    }`}
                  >
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight">Donations & Giving</h4>
                    <p
                      className={`text-[10px] mt-0.5 leading-tight ${
                        pathname.startsWith("/donations")
                          ? "text-white/70"
                          : "text-neutral-500"
                      }`}
                    >
                      Telebirr & CBE ministry donations
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50 shrink-0" />
              </button>

              {/* Users & Access */}
              <button
                type="button"
                id="mobile-nav-users"
                onClick={() => handleNavigation("/users")}
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all touch-manipulation cursor-pointer text-left active:scale-[0.98] ${
                  pathname.startsWith("/users")
                    ? "bg-[#202328] text-white"
                    : "bg-neutral-50 hover:bg-neutral-100 text-[#202328]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      pathname.startsWith("/users")
                        ? "bg-[#F6CE46] text-[#202328]"
                        : "bg-white text-[#202328] border border-black/10"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight">Console Users & Roles</h4>
                    <p
                      className={`text-[10px] mt-0.5 leading-tight ${
                        pathname.startsWith("/users")
                          ? "text-white/70"
                          : "text-neutral-500"
                      }`}
                    >
                      Manage pastoral admins & permissions
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50 shrink-0" />
              </button>
            </div>

            {/* Section Divider */}
            <div className="my-2 border-t border-black/[0.06]" />

            {/* Utility Actions */}
            <div className="space-y-1.5 pt-1">
              {/* Audience Demographics Trigger */}
              <button
                type="button"
                id="mobile-demographics-trigger"
                onClick={handleDemographicsClick}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#F6CE46]/15 hover:bg-[#F6CE46]/25 border border-[#F6CE46]/30 text-[#202328] transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#F6CE46] flex items-center justify-center text-[#202328] shadow-2xs shrink-0">
                    <PieChart className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight flex items-center gap-1.5">
                      <span>Audience Demographics</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-[#202328] text-white text-[9px] font-bold">
                        Regional
                      </span>
                    </h4>
                    <p className="text-[10px] text-neutral-600 mt-0.5 leading-tight">
                      View Ethiopia & Diaspora stats & charts
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#202328] opacity-60 shrink-0" />
              </button>

              {/* Sync Remote Backend */}
              <button
                type="button"
                id="mobile-sync-trigger"
                onClick={handleSync}
                disabled={isRefreshing}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100 text-[#202328] transition-colors cursor-pointer text-left border border-black/[0.04]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#202328] shadow-2xs shrink-0">
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#F6CE46]" : ""}`} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight">Sync Data with Server</h4>
                    <p className="text-[10px] text-neutral-500 mt-0.5 leading-tight">
                      Fetch fresh records from bot backend
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-neutral-400 font-medium">
                  {isRefreshing ? "Syncing..." : "Refresh"}
                </span>
              </button>

              {/* Sign Out */}
              <button
                type="button"
                id="mobile-logout-trigger"
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer text-left border border-red-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-red-200 flex items-center justify-center text-red-600 shadow-2xs shrink-0">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight">Sign Out</h4>
                    <p className="text-[10px] text-red-500 mt-0.5 leading-tight">
                      End current session on this device
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-red-500 font-semibold">
                  {user?.firstName || "Account"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
