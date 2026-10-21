"use client";

import React, { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { DemographicsSidebar } from "@/components/demographics/DemographicsSidebar";
import { AppHeader } from "@/components/shell/AppHeader";
import { AppHero } from "@/components/shell/AppHero";
import { useAdminData } from "@/context/AdminDataContext";
import { useAuth } from "@/context/AuthContext";

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    isLoading,
    totalClients,
    verifiedClients,
    ethiopianClients,
    diasporaClients,
    unsharedClients,
    amharicClients,
    englishClients,
    oromoClients,
    otherLangClients,
    adminRoles,
    counselorRoles,
    counselingCount,
    innerHealingCount,
    coursesCount,
    resourceCount,
    clientFilter,
    setClientFilter,
  } = useAdminData();

  // Prevent flash of unauthenticated dashboard before router.push("/login") completes
  if (isAuthLoading || !isAuthenticated) {
    return (
      <div
        id="admin-auth-guard-loading"
        className="h-screen w-full bg-[#EBECEF] flex flex-col items-center justify-center p-6 select-none"
      >
        <div className="flex flex-col items-center gap-3 bg-white/90 border border-black/10 rounded-3xl p-8 shadow-sm max-w-xs w-full text-center">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full bg-[#F6CE46] ring-2 ring-[#202328]/20 animate-pulse" />
            <span className="font-bold text-[#202328] text-base">Purity Matters</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-600 font-medium">
            <Loader2 className="w-4 h-4 animate-spin text-[#202328]" />
            <span>Verifying console authorization...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="admin-dashboard-container"
      className="h-screen max-h-screen w-full max-w-full bg-[#EBECEF] flex flex-col lg:flex-row text-[#202328] overflow-hidden"
    >
      {/* MAIN DASHBOARD CONTENT (LEFT / CENTER) */}
      <div
        id="admin-main-wrapper"
        className="flex-1 flex flex-col min-w-0 w-full h-full overflow-hidden"
      >
        <AppHeader />

        <main
          id="admin-main"
          className="flex-1 flex flex-col min-h-0 w-full p-4 lg:p-6 gap-3.5 lg:gap-4 overflow-hidden"
        >
          <div className="shrink-0">
            <AppHero />
          </div>

          <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
            {children}
          </div>
        </main>
      </div>

      {/* DEMOGRAPHICS SIDEBAR (RIGHT COLUMN) */}
      <DemographicsSidebar
        isLoading={isLoading}
        totalClients={totalClients}
        verifiedClients={verifiedClients}
        ethiopianClients={ethiopianClients}
        diasporaClients={diasporaClients}
        unsharedClients={unsharedClients}
        amharicClients={amharicClients}
        englishClients={englishClients}
        oromoClients={oromoClients}
        otherLangClients={otherLangClients}
        adminRoles={adminRoles}
        counselorRoles={counselorRoles}
        counselingCount={counselingCount}
        innerHealingCount={innerHealingCount}
        coursesCount={coursesCount}
        resourceCount={resourceCount}
        clientFilter={clientFilter}
        onFilterChange={setClientFilter}
        onSelectTab={(tab) => {
          if (tab === "clients") {
            router.push("/clients");
          } else {
            router.push("/");
          }
        }}
      />
    </div>
  );
}
