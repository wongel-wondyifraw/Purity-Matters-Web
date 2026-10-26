"use client";

import React from "react";
import { AdminShell } from "@/components/shell/AdminShell";
import { DonationsTable } from "@/components/donations/DonationsTable";

export default function DonationsPage() {
  return (
    <AdminShell>
      <DonationsTable />
    </AdminShell>
  );
}
