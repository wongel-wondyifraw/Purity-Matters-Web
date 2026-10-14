"use client";

import React from "react";
import { AdminShell } from "@/components/shell/AdminShell";
import { ReportsView } from "@/components/reports/ReportsView";

export default function ReportsPage() {
  return (
    <AdminShell>
      <ReportsView />
    </AdminShell>
  );
}
