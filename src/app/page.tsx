"use client";

import React from "react";
import { AdminShell } from "@/components/shell/AdminShell";
import { OverviewWidgets } from "@/components/overview/OverviewWidgets";

export default function DashboardOverviewPage() {
  return (
    <AdminShell>
      <OverviewWidgets />
    </AdminShell>
  );
}
