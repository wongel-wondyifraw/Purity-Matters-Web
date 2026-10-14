"use client";

import React from "react";
import { AdminShell } from "@/components/shell/AdminShell";
import { InnerHealingTable } from "@/components/inner-healing/InnerHealingTable";

export default function InnerHealingPage() {
  return (
    <AdminShell>
      <InnerHealingTable />
    </AdminShell>
  );
}
