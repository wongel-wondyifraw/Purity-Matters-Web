"use client";

import React, { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { DemographicsSidebar } from "@/components/demographics/DemographicsSidebar";
import { AppHeader } from "@/components/shell/AppHeader";
import { AppHero } from "@/components/shell/AppHero";
import { useAdminData } from "@/context/AdminDataContext";

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
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
